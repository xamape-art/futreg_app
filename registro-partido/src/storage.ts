import type { MatchAction, Player } from './types';

const KEYS = {
  roster: 'rp.roster',
  actions: 'rp.actions',
  match: 'rp.match',
  matchInfo: 'rp.matchInfo',
  matchId: 'rp.matchId',
} as const;

export interface PersistedMatch {
  phase: string;
  seconds: number;
  half: 1 | 2;
}

export interface PersistedMatchInfo {
  date: string;
  local: string;
  visitante: string;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadRoster(): Player[] | null {
  return safeParse<Player[]>(localStorage.getItem(KEYS.roster));
}

export function saveRoster(roster: Player[]) {
  localStorage.setItem(KEYS.roster, JSON.stringify(roster));
}

export function loadActions(): MatchAction[] | null {
  return safeParse<MatchAction[]>(localStorage.getItem(KEYS.actions));
}

export function saveActions(actions: MatchAction[]) {
  localStorage.setItem(KEYS.actions, JSON.stringify(actions));
}

export function loadMatch(): PersistedMatch | null {
  return safeParse<PersistedMatch>(localStorage.getItem(KEYS.match));
}

export function saveMatch(match: PersistedMatch) {
  localStorage.setItem(KEYS.match, JSON.stringify(match));
}

export function loadMatchInfo(): PersistedMatchInfo | null {
  return safeParse<PersistedMatchInfo>(localStorage.getItem(KEYS.matchInfo));
}

export function saveMatchInfo(info: PersistedMatchInfo) {
  localStorage.setItem(KEYS.matchInfo, JSON.stringify(info));
}

/** uuid del partido en Supabase, para reengancharlo tras recargar la pagina. */
export function loadMatchId(): string | null {
  return localStorage.getItem(KEYS.matchId);
}

export function saveMatchId(matchId: string | null) {
  if (matchId) localStorage.setItem(KEYS.matchId, matchId);
  else localStorage.removeItem(KEYS.matchId);
}
