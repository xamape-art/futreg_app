import type { ActionType, DuelResult, Phase, Player, ShotType } from './types';

export interface ActionMeta {
  label: string;
  short: string;
  color: string;
}

export const ACTION_META: Record<ActionType, ActionMeta> = {
  gol: { label: 'GOL', short: 'Goles', color: '#E30613' },
  ocasion: { label: 'OCASIÓN', short: 'Ocasiones', color: '#F5A623' },
  tiro: { label: 'DUELO', short: 'Duelos', color: '#2D9CDB' },
  falta: { label: 'PÉRDIDA', short: 'Pérdidas', color: '#8A94A6' },
};

export const ACTION_TYPES: ActionType[] = ['gol', 'ocasion', 'tiro', 'falta'];

export const HAS_GOAL_STEP: ActionType[] = ['gol', 'ocasion'];

export const DUEL_RESULT_META: Record<DuelResult, { label: string; color: string }> = {
  ganado: { label: 'GANADO', color: '#22c55e' },
  perdido: { label: 'PÉRDIDO', color: '#ef4444' },
};

export const SHOT_TYPE_META: Record<ShotType, { label: string; color: string }> = {
  tiro: { label: 'Tiro', color: '#FFD400' },
  '1v1': { label: '1Vs1', color: '#a78bfa' },
  pie: { label: 'Remate pie', color: '#34d399' },
  cabeza: { label: 'Remate cabeza', color: '#fb7185' },
};

export const SHOT_TYPES: ShotType[] = ['tiro', '1v1', 'pie', 'cabeza'];

export const DEFAULT_LOCAL = 'Mi Club';
export const DEFAULT_VISITANTE = 'Rival';
export const DEFAULT_PRIMARY = '#E30613';

export const DEFAULT_ROSTER: Player[] = [
  { id: 1, n: 1, name: 'Asier', x: 50, y: 90, photo: null },
  { id: 2, n: 2, name: 'Unai', x: 15, y: 73, photo: null },
  { id: 3, n: 3, name: 'Pedro', x: 38, y: 76, photo: null },
  { id: 4, n: 4, name: 'Germán', x: 62, y: 76, photo: null },
  { id: 5, n: 5, name: 'Manuel', x: 85, y: 73, photo: null },
  { id: 6, n: 6, name: 'López', x: 34, y: 56, photo: null },
  { id: 7, n: 8, name: 'Manolo', x: 66, y: 56, photo: null },
  { id: 8, n: 7, name: 'Salinas', x: 18, y: 36, photo: null },
  { id: 9, n: 10, name: 'Pedrosa', x: 50, y: 33, photo: null },
  { id: 10, n: 11, name: 'Jaime', x: 82, y: 36, photo: null },
  { id: 11, n: 9, name: 'Julian', x: 50, y: 14, photo: null },
];

export interface PhaseConfig {
  label: string;
  bg: string;
  fg: string;
}

export function getPhaseConfig(primary: string): Record<Phase, PhaseConfig> {
  return {
    pre: { label: 'INICIAR 1ª PARTE', bg: primary, fg: '#fff' },
    '1H': { label: 'DETENER', bg: '#FFD400', fg: '#111' },
    ht: { label: 'COMENZAR 2ª PARTE', bg: primary, fg: '#fff' },
    '2H': { label: 'DETENER', bg: '#FFD400', fg: '#111' },
    ft: { label: 'FINALIZAR PARTIDO', bg: '#E30613', fg: '#fff' },
    end: { label: 'NUEVO PARTIDO', bg: '#39404b', fg: '#eef1f5' },
  };
}

export const LIVE_CONFIG: Record<Phase, [string, string]> = {
  pre: ['', ' '],
  '1H': ['● EN JUEGO', '#4ade80'],
  ht: ['● DESCANSO', '#F5A623'],
  '2H': ['● EN JUEGO', '#4ade80'],
  ft: ['● FINALIZADO', '#8A94A6'],
  end: ['● FINALIZADO', '#8A94A6'],
};
