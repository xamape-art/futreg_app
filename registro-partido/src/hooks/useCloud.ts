import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as repo from '../cloud/repository';
import { cloudEnabled, supabase } from '../lib/supabase';
import type { Action } from '../state';
import type { MatchState, MatchSummary, SyncStatus } from '../types';

/** Margen tras el ultimo cambio antes de escribir, para no ir por accion. */
const PUSH_DEBOUNCE_MS = 900;
/** El cronometro no dispara escrituras; se vuelca cada tanto mientras corre. */
const CLOCK_FLUSH_MS = 30_000;

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

function matchPatch(state: MatchState): repo.MatchPatch {
  return {
    date: state.matchDate,
    local: state.local,
    visitante: state.visitante,
    phase: state.phase,
    seconds: state.seconds,
    half: state.half,
  };
}

/**
 * Supabase devuelve los fallos del magic link en la propia URL de vuelta
 * (en el hash con flujo implicito, en la query con PKCE). Sin leerlos, la app
 * repinta el login sin decir nada y parece que el enlace no hizo nada.
 */
function readAuthErrorFromUrl(): string | null {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(window.location.search);
  const description = hash.get('error_description') ?? query.get('error_description');
  const code = hash.get('error_code') ?? query.get('error_code') ?? hash.get('error') ?? query.get('error');
  if (!description && !code) return null;

  // Solo se limpia cuando hay error: si hubiera tokens, borrarlos aqui
  // impediria que detectSessionInUrl los leyera.
  window.history.replaceState({}, '', window.location.pathname);
  return description ? `${description}${code ? ` (${code})` : ''}` : code;
}

export interface Cloud {
  enabled: boolean;
  session: Session | null;
  status: SyncStatus;
  error: string | null;
  /** Error devuelto por el enlace del email, si lo hubo. */
  authError: string | null;
  history: MatchSummary[];
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  setPhoto: (playerId: number, file: File) => Promise<void>;
  openMatch: (matchId: string) => Promise<void>;
  removeMatch: (matchId: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export function useCloud(state: MatchState, dispatch: React.Dispatch<Action>): Cloud {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SyncStatus>(cloudEnabled ? 'signed-out' : 'off');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<MatchSummary[]>([]);
  // Se lee una sola vez, en el primer render, antes de que nadie toque la URL.
  const [authError, setAuthError] = useState<string | null>(() =>
    cloudEnabled ? readAuthErrorFromUrl() : null,
  );

  // El push lee siempre el estado mas reciente, no el que capturo el efecto.
  const stateRef = useRef(state);
  stateRef.current = state;

  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = session;

  /** Solo se empuja despues de hidratar; si no, el primer render pisaria la nube. */
  const ready = useRef(false);
  /** Las escrituras se encadenan para que dos pushes no creen dos partidos. */
  const chain = useRef<Promise<void>>(Promise.resolve());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -------------------------------------------------------------------------
  // Sesion
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        ready.current = false;
        setStatus('signed-out');
        setHistory([]);
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // -------------------------------------------------------------------------
  // Escritura
  // -------------------------------------------------------------------------

  const push = useCallback(async () => {
    const current = sessionRef.current;
    if (!current || !ready.current) return;
    const snapshot = stateRef.current;
    const userId = current.user.id;

    setStatus('saving');
    try {
      let matchId = snapshot.matchId;
      if (matchId) {
        await repo.updateMatch(matchId, matchPatch(snapshot));
      } else {
        matchId = await repo.createMatch(userId, matchPatch(snapshot));
        dispatch({ type: 'SET_MATCH_ID', matchId });
      }
      await repo.syncActions(userId, matchId, snapshot.actions);
      await repo.saveRoster(userId, snapshot.roster);
      setStatus('idle');
      setError(null);
    } catch (e) {
      setStatus('error');
      setError(errorMessage(e));
    }
  }, [dispatch]);

  const enqueuePush = useCallback(() => {
    chain.current = chain.current.then(push, push);
    return chain.current;
  }, [push]);

  const schedulePush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(enqueuePush, PUSH_DEBOUNCE_MS);
  }, [enqueuePush]);

  // -------------------------------------------------------------------------
  // Hidratacion al entrar
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    (async () => {
      setStatus('hydrating');
      try {
        const roster = await repo.fetchRoster();
        if (cancelled) return;
        if (roster) dispatch({ type: 'HYDRATE_ROSTER', roster });

        // La nube solo reemplaza el partido en curso si aqui no hay nada
        // empezado. Asi un registro hecho sin cobertura nunca se pierde al
        // volver la conexion: se sube como partido nuevo.
        const local = stateRef.current;
        const localIsEmpty = local.phase === 'pre' && local.actions.length === 0;
        if (localIsEmpty) {
          const open = await repo.fetchOpenMatch();
          if (cancelled) return;
          if (open) {
            dispatch({
              type: 'HYDRATE_MATCH',
              matchId: open.id,
              date: open.date,
              local: open.local,
              visitante: open.visitante,
              phase: open.phase,
              seconds: open.seconds,
              half: open.half,
              actions: open.actions,
            });
          } else {
            dispatch({ type: 'SET_MATCH_ID', matchId: null });
          }
        }

        const rows = await repo.fetchHistory();
        if (cancelled) return;
        setHistory(rows);

        ready.current = true;
        setStatus('idle');
        setError(null);
        enqueuePush();
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setError(errorMessage(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, dispatch, enqueuePush]);

  // -------------------------------------------------------------------------
  // Disparadores
  // -------------------------------------------------------------------------

  // "seconds" queda fuera a proposito: cambia cada segundo y provocaria una
  // escritura por tick. Se sube igualmente en el payload de cualquier push.
  const signature = JSON.stringify({
    matchId: state.matchId,
    date: state.matchDate,
    local: state.local,
    visitante: state.visitante,
    phase: state.phase,
    half: state.half,
    actions: state.actions,
    roster: state.roster,
  });

  useEffect(() => {
    if (!ready.current) return;
    schedulePush();
  }, [signature, schedulePush]);

  useEffect(() => {
    if (!state.running) return;
    const iv = setInterval(enqueuePush, CLOCK_FLUSH_MS);
    return () => clearInterval(iv);
  }, [state.running, enqueuePush]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Acciones expuestas a la UI
  // -------------------------------------------------------------------------

  const signIn = useCallback(async (email: string) => {
    if (!supabase) return;
    setAuthError(null);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    });
    if (signInError) throw signInError;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    ready.current = false;
    await supabase.auth.signOut();
  }, []);

  const setPhoto = useCallback(
    async (playerId: number, file: File) => {
      const current = sessionRef.current;
      if (!current) {
        // Modo local: se queda como data URL, igual que antes de la nube.
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        dispatch({ type: 'SET_PHOTO', id: playerId, photo: dataUrl, path: null });
        return;
      }
      try {
        const { path, url } = await repo.uploadPhoto(current.user.id, playerId, file);
        dispatch({ type: 'SET_PHOTO', id: playerId, photo: url, path });
      } catch (e) {
        setStatus('error');
        setError(errorMessage(e));
      }
    },
    [dispatch],
  );

  const refreshHistory = useCallback(async () => {
    if (!sessionRef.current) return;
    try {
      setHistory(await repo.fetchHistory());
    } catch (e) {
      setStatus('error');
      setError(errorMessage(e));
    }
  }, []);

  const openMatch = useCallback(
    async (matchId: string) => {
      if (!sessionRef.current) return;
      const row = history.find((m) => m.id === matchId);
      if (!row) return;
      try {
        // Se vuelca el pendiente antes de cambiar de partido.
        await enqueuePush();
        const actions = await repo.fetchActions(matchId);
        dispatch({
          type: 'HYDRATE_MATCH',
          matchId,
          date: row.date,
          local: row.local,
          visitante: row.visitante,
          phase: row.finished ? 'end' : 'pre',
          seconds: row.seconds,
          half: 1,
          actions,
        });
        dispatch({ type: 'SET_TAB', tab: 'partido' });
      } catch (e) {
        setStatus('error');
        setError(errorMessage(e));
      }
    },
    [dispatch, enqueuePush, history],
  );

  const removeMatch = useCallback(
    async (matchId: string) => {
      try {
        await repo.deleteMatch(matchId);
        setHistory((prev) => prev.filter((m) => m.id !== matchId));
        if (stateRef.current.matchId === matchId) dispatch({ type: 'SET_MATCH_ID', matchId: null });
      } catch (e) {
        setStatus('error');
        setError(errorMessage(e));
      }
    },
    [dispatch],
  );

  return {
    enabled: cloudEnabled,
    session,
    status,
    error,
    authError,
    history,
    signIn,
    signOut,
    setPhoto,
    openMatch,
    removeMatch,
    refreshHistory,
  };
}
