import { ACTION_META, ACTION_TYPES, SHOT_TYPE_META, SHOT_TYPES } from './constants';
import type { ActionType, MatchAction, MatchState } from './types';

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export function minuteStr(seconds: number): string {
  return Math.floor(seconds / 60) + "'";
}

export function formatMatchDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function countByType(actions: MatchAction[], type: string): number {
  return actions.filter((a) => a.type === type).length;
}

export function counters(actions: MatchAction[]) {
  return ACTION_TYPES.map((k) => ({
    key: k,
    short: ACTION_META[k].short,
    color: ACTION_META[k].color,
    count: countByType(actions, k),
  }));
}

export interface ShotTypeTally {
  key: (typeof SHOT_TYPES)[number];
  label: string;
  count: number;
}

export function shotTypeBreakdown(actions: MatchAction[], type: ActionType): ShotTypeTally[] {
  return SHOT_TYPES.map((k) => ({
    key: k,
    label: SHOT_TYPE_META[k].label,
    count: actions.filter((a) => a.type === type && a.shotType === k).length,
  }));
}

export function playerLabel(action: MatchAction): string {
  return action.player ? `${action.player.name} · ${action.player.n}` : 'Sin jugador';
}

export interface TimelineBucket {
  label: string;
  counts: Record<ActionType, number>;
  total: number;
}

export function timelineBuckets(actions: MatchAction[], totalSeconds: number, bucketMinutes = 15): TimelineBucket[] {
  const maxMinute = Math.max(totalSeconds / 60, ...actions.map((a) => a.seconds / 60), 90);
  const bucketCount = Math.max(1, Math.ceil(maxMinute / bucketMinutes));
  const buckets: TimelineBucket[] = Array.from({ length: bucketCount }, (_, i) => ({
    label: `${i * bucketMinutes}-${(i + 1) * bucketMinutes}'`,
    counts: { gol: 0, ocasion: 0, tiro: 0, falta: 0 },
    total: 0,
  }));
  actions.forEach((a) => {
    const idx = Math.min(Math.floor(a.seconds / 60 / bucketMinutes), bucketCount - 1);
    buckets[idx].counts[a.type] += 1;
    buckets[idx].total += 1;
  });
  return buckets;
}

export interface PlayerTally {
  id: number;
  n: number;
  name: string;
  count: number;
}

export function topPlayers(actions: MatchAction[], limit = 5): PlayerTally[] {
  const tally = new Map<number, PlayerTally>();
  actions.forEach((a) => {
    if (!a.player) return;
    const cur = tally.get(a.player.id) ?? { id: a.player.id, n: a.player.n, name: a.player.name, count: 0 };
    cur.count += 1;
    tally.set(a.player.id, cur);
  });
  return Array.from(tally.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface PlayerDuelTally {
  id: number;
  n: number;
  name: string;
  won: number;
  lost: number;
  total: number;
}

export function duelsByPlayer(actions: MatchAction[]): PlayerDuelTally[] {
  const tally = new Map<number, PlayerDuelTally>();
  actions.forEach((a) => {
    if (a.type !== 'tiro' || !a.player || !a.duelResult) return;
    const cur =
      tally.get(a.player.id) ?? { id: a.player.id, n: a.player.n, name: a.player.name, won: 0, lost: 0, total: 0 };
    if (a.duelResult === 'ganado') cur.won += 1;
    else cur.lost += 1;
    cur.total += 1;
    tally.set(a.player.id, cur);
  });
  return Array.from(tally.values()).sort((a, b) => b.total - a.total);
}

export function buildSummaryText(state: MatchState): string {
  const { local, visitante, actions } = state;
  const lines = actions.map(
    (a) =>
      `${minuteStr(a.seconds)} ${ACTION_META[a.type].label}` +
      (a.player ? ` - ${a.player.name} (${a.player.n})` : '') +
      (a.assistPlayer ? ` [asiste: ${a.assistPlayer.name} (${a.assistPlayer.n})]` : '') +
      (a.note ? ` | ${a.note}` : ''),
  );
  const header = `${local} vs ${visitante} · ${formatMatchDate(state.matchDate)} (${minuteStr(state.seconds)})`;
  const totals = `Goles: ${countByType(actions, 'gol')} | Ocasiones: ${countByType(actions, 'ocasion')} | Tiros: ${countByType(actions, 'tiro')} | Faltas: ${countByType(actions, 'falta')}`;
  const body = lines.length ? lines.join('\n') : 'Sin acciones registradas.';
  return `${header}\n${totals}\n\n${body}`;
}
