import { supabase } from '../lib/supabase';
import type { ActionType, MatchAction, MatchSummary, Phase, Player } from '../types';

const PHOTO_BUCKET = 'player-photos';
const SIGNED_URL_TTL = 60 * 60; // 1 hora; se vuelve a firmar en cada carga

/** Las firmas de abajo asumen que hay cliente; esto lo garantiza en un sitio. */
function client() {
  if (!supabase) throw new Error('Supabase no esta configurado');
  return supabase;
}

// ---------------------------------------------------------------------------
// Plantilla
// ---------------------------------------------------------------------------

interface PlayerRow {
  local_id: number;
  numero: number;
  name: string;
  x: number;
  y: number;
  photo_path: string | null;
}

/** Firma las rutas de Storage para poder pintarlas como background-image. */
async function withSignedPhotos(rows: PlayerRow[]): Promise<Player[]> {
  const paths = rows.map((r) => r.photo_path).filter((p): p is string => Boolean(p));
  const signed = new Map<string, string>();

  if (paths.length) {
    const { data } = await client().storage.from(PHOTO_BUCKET).createSignedUrls(paths, SIGNED_URL_TTL);
    data?.forEach((entry) => {
      if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl);
    });
  }

  return rows.map((r) => ({
    id: r.local_id,
    n: r.numero,
    name: r.name,
    x: r.x,
    y: r.y,
    photo: r.photo_path ? (signed.get(r.photo_path) ?? null) : null,
    photoPath: r.photo_path,
  }));
}

export async function fetchRoster(): Promise<Player[] | null> {
  const { data, error } = await client()
    .from('players')
    .select('local_id, numero, name, x, y, photo_path')
    .order('local_id');
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return withSignedPhotos(data as PlayerRow[]);
}

export async function saveRoster(userId: string, roster: Player[]): Promise<void> {
  const rows = roster.map((p) => ({
    user_id: userId,
    local_id: p.id,
    numero: p.n,
    name: p.name,
    x: p.x,
    y: p.y,
    photo_path: p.photoPath ?? null,
  }));
  const { error } = await client().from('players').upsert(rows, { onConflict: 'user_id,local_id' });
  if (error) throw error;
}

/**
 * Sube la foto al bucket privado y devuelve la ruta mas una URL firmada lista
 * para pintar. Sustituye al base64 en localStorage, que reventaba la cuota de
 * ~5 MB con dos o tres fotos hechas con el movil.
 */
export async function uploadPhoto(
  userId: string,
  playerId: number,
  file: File,
): Promise<{ path: string; url: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${playerId}.${ext}`;

  const { error } = await client()
    .storage.from(PHOTO_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) throw error;

  const { data, error: signError } = await client()
    .storage.from(PHOTO_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signError) throw signError;

  return { path, url: data.signedUrl };
}

// ---------------------------------------------------------------------------
// Partidos
// ---------------------------------------------------------------------------

export interface MatchPatch {
  date: string;
  local: string;
  visitante: string;
  phase: Phase;
  seconds: number;
  half: 1 | 2;
}

export interface OpenMatch extends MatchPatch {
  id: string;
  actions: MatchAction[];
}

export async function createMatch(userId: string, patch: MatchPatch): Promise<string> {
  const { data, error } = await client()
    .from('matches')
    .insert({
      user_id: userId,
      match_date: patch.date,
      local: patch.local,
      visitante: patch.visitante,
      phase: patch.phase,
      seconds: patch.seconds,
      half: patch.half,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateMatch(matchId: string, patch: MatchPatch): Promise<void> {
  const { error } = await client()
    .from('matches')
    .update({
      match_date: patch.date,
      local: patch.local,
      visitante: patch.visitante,
      phase: patch.phase,
      seconds: patch.seconds,
      half: patch.half,
      // 'end' es la fase en la que el cliente da el partido por cerrado.
      finished_at: patch.phase === 'end' ? new Date().toISOString() : null,
    })
    .eq('id', matchId);
  if (error) throw error;
}

/** Recupera el ultimo partido sin cerrar, para seguir donde se dejo. */
export async function fetchOpenMatch(): Promise<OpenMatch | null> {
  const { data, error } = await client()
    .from('matches')
    .select('id, match_date, local, visitante, phase, seconds, half')
    .is('finished_at', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id as string,
    date: data.match_date as string,
    local: data.local as string,
    visitante: data.visitante as string,
    phase: data.phase as Phase,
    seconds: data.seconds as number,
    half: data.half as 1 | 2,
    actions: await fetchActions(data.id as string),
  };
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------

interface ActionRow {
  client_id: number;
  type: ActionType;
  seconds: number;
  player: MatchAction['player'];
  assist_player: MatchAction['assistPlayer'];
  point: MatchAction['point'];
  drag: MatchAction['drag'];
  goal_point: MatchAction['goalPoint'];
  goal_drag: MatchAction['goalDrag'];
  duel_result: MatchAction['duelResult'];
  shot_type: MatchAction['shotType'];
  note: string;
}

const ACTION_COLUMNS =
  'client_id, type, seconds, player, assist_player, point, drag, goal_point, goal_drag, duel_result, shot_type, note';

function toAction(row: ActionRow): MatchAction {
  return {
    id: Number(row.client_id),
    type: row.type,
    seconds: row.seconds,
    player: row.player,
    assistPlayer: row.assist_player,
    point: row.point,
    drag: row.drag,
    goalPoint: row.goal_point,
    goalDrag: row.goal_drag,
    duelResult: row.duel_result,
    shotType: row.shot_type,
    note: row.note ?? '',
  };
}

export async function fetchActions(matchId: string): Promise<MatchAction[]> {
  const { data, error } = await client()
    .from('actions')
    .select(ACTION_COLUMNS)
    .eq('match_id', matchId)
    .order('seconds');
  if (error) throw error;
  return (data as ActionRow[] | null)?.map(toAction) ?? [];
}

/**
 * Deja las acciones remotas del partido identicas a las locales: upsert de las
 * presentes y borrado de las que el usuario haya eliminado. Un partido tiene
 * como mucho unas decenas de acciones, asi que mandarlas enteras es mas barato
 * que llevar un diario de cambios.
 */
export async function syncActions(userId: string, matchId: string, actions: MatchAction[]): Promise<void> {
  const db = client();

  if (actions.length) {
    const rows = actions.map((a) => ({
      user_id: userId,
      match_id: matchId,
      client_id: a.id,
      type: a.type,
      seconds: a.seconds,
      player: a.player,
      assist_player: a.assistPlayer,
      point: a.point,
      drag: a.drag,
      goal_point: a.goalPoint,
      goal_drag: a.goalDrag,
      duel_result: a.duelResult,
      shot_type: a.shotType,
      note: a.note,
    }));
    const { error } = await db.from('actions').upsert(rows, { onConflict: 'match_id,client_id' });
    if (error) throw error;
  }

  const keep = actions.map((a) => a.id);
  const query = db.from('actions').delete().eq('match_id', matchId);
  const { error: deleteError } = keep.length
    ? await query.not('client_id', 'in', `(${keep.join(',')})`)
    : await query;
  if (deleteError) throw deleteError;
}

// ---------------------------------------------------------------------------
// Historial
// ---------------------------------------------------------------------------

const EMPTY_COUNTS: Record<ActionType, number> = { gol: 0, ocasion: 0, tiro: 0, falta: 0 };

export async function fetchHistory(limit = 50): Promise<MatchSummary[]> {
  const { data, error } = await client()
    .from('matches')
    .select('id, match_date, local, visitante, seconds, finished_at, actions(type)')
    .order('match_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const counts = { ...EMPTY_COUNTS };
    (row.actions as { type: ActionType }[] | null)?.forEach((a) => {
      if (a.type in counts) counts[a.type] += 1;
    });
    return {
      id: row.id as string,
      date: row.match_date as string,
      local: row.local as string,
      visitante: row.visitante as string,
      seconds: row.seconds as number,
      finished: row.finished_at !== null,
      counts,
    };
  });
}

export async function deleteMatch(matchId: string): Promise<void> {
  const { error } = await client().from('matches').delete().eq('id', matchId);
  if (error) throw error;
}
