export type ActionType = 'gol' | 'ocasion' | 'tiro' | 'falta';

export type DuelResult = 'ganado' | 'perdido';

export type ShotType = 'tiro' | '1v1' | 'pie' | 'cabeza';

export type Phase = 'pre' | '1H' | 'ht' | '2H' | 'ft' | 'end';

export type Tab = 'partido' | 'plantilla' | 'historial';

export interface Player {
  id: number;
  n: number;
  name: string;
  x: number;
  y: number;
  /** URL mostrable: data: en modo local, https firmada cuando viene de Storage. */
  photo: string | null;
  /** Ruta dentro del bucket player-photos. null mientras la foto solo sea local. */
  photoPath?: string | null;
}

export interface PlayerRef {
  id: number;
  n: number;
  name: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Drag {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface MatchAction {
  id: number;
  type: ActionType;
  seconds: number;
  player: PlayerRef | null;
  assistPlayer: PlayerRef | null;
  point: Point | null;
  drag: Drag | null;
  goalPoint: Point | null;
  goalDrag: Drag | null;
  duelResult: DuelResult | null;
  shotType: ShotType | null;
  note: string;
}

/** Estado del sincronizado con Supabase, para el indicador de la cabecera. */
export type SyncStatus = 'off' | 'signed-out' | 'hydrating' | 'idle' | 'saving' | 'error';

/** Fila del historial: un partido pasado con sus totales por tipo de accion. */
export interface MatchSummary {
  id: string;
  date: string;
  local: string;
  visitante: string;
  seconds: number;
  finished: boolean;
  counts: Record<ActionType, number>;
}

export interface MatchState {
  /** uuid del partido en Supabase. null en modo local o antes de crearlo. */
  matchId: string | null;
  phase: Phase;
  running: boolean;
  seconds: number;
  half: 1 | 2;
  roster: Player[];
  actions: MatchAction[];

  modalOpen: boolean;
  pendingType: ActionType | null;
  selPlayer: PlayerRef | null;
  assistPlayer: PlayerRef | null;
  point: Point | null;
  drag: Drag | null;
  shotDone: boolean;
  goalPoint: Point | null;
  goalDrag: Drag | null;
  duelResult: DuelResult | null;
  shotType: ShotType | null;
  note: string;

  showSummary: boolean;
  copied: boolean;
  tab: Tab;
  sumType: ActionType | 'all';
  sumPlayer: string;

  matchDate: string;
  local: string;
  visitante: string;
  primary: string;
  matchModalOpen: boolean;
}
