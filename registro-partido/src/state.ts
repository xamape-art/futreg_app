import {
  DEFAULT_LOCAL,
  DEFAULT_PRIMARY,
  DEFAULT_ROSTER,
  DEFAULT_VISITANTE,
  HAS_GOAL_STEP,
} from './constants';
import { loadActions, loadMatch, loadMatchInfo, loadRoster } from './storage';
import type {
  ActionType,
  Drag,
  DuelResult,
  MatchState,
  PlayerRef,
  Point,
  ShotType,
  Tab,
} from './types';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createInitialState(): MatchState {
  const persistedMatch = loadMatch();
  const persistedMatchInfo = loadMatchInfo();
  return {
    phase: (persistedMatch?.phase as MatchState['phase']) ?? 'pre',
    running: false,
    seconds: persistedMatch?.seconds ?? 0,
    half: persistedMatch?.half ?? 1,
    roster: loadRoster() ?? DEFAULT_ROSTER,
    actions: loadActions() ?? [],

    modalOpen: false,
    pendingType: null,
    selPlayer: null,
    assistPlayer: null,
    point: null,
    drag: null,
    shotDone: false,
    goalPoint: null,
    goalDrag: null,
    duelResult: null,
    shotType: null,
    note: '',

    showSummary: false,
    copied: false,
    tab: 'partido',
    sumType: 'all',
    sumPlayer: 'all',

    matchDate: persistedMatchInfo?.date ?? today(),
    local: persistedMatchInfo?.local ?? DEFAULT_LOCAL,
    visitante: persistedMatchInfo?.visitante ?? DEFAULT_VISITANTE,
    primary: DEFAULT_PRIMARY,
    matchModalOpen: false,
  };
}

export type Action =
  | { type: 'TICK' }
  | { type: 'ADVANCE' }
  | { type: 'RESET_TIMER' }
  | { type: 'SET_TIME'; seconds: number }
  | { type: 'OPEN_MODAL'; actionType: ActionType }
  | { type: 'CANCEL_MODAL' }
  | { type: 'PITCH_DOWN'; point: Point }
  | { type: 'PITCH_MOVE'; point: Point }
  | { type: 'PITCH_UP' }
  | { type: 'GOAL_DOWN'; point: Point }
  | { type: 'GOAL_MOVE'; point: Point }
  | { type: 'SET_DUEL_RESULT'; result: DuelResult }
  | { type: 'SET_SHOT_TYPE'; shotType: ShotType }
  | { type: 'SELECT_ASSIST_PLAYER'; player: PlayerRef }
  | { type: 'CHANGE_ASSIST' }
  | { type: 'SELECT_PLAYER'; player: PlayerRef }
  | { type: 'CHANGE_PLAYER' }
  | { type: 'SET_NOTE'; note: string }
  | { type: 'SAVE_ACTION' }
  | { type: 'DELETE_ACTION'; id: number }
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'SET_ROSTER_FIELD'; id: number; field: 'name' | 'n'; value: string }
  | { type: 'SET_PHOTO'; id: number; photo: string }
  | { type: 'OPEN_SUMMARY' }
  | { type: 'CLOSE_SUMMARY' }
  | { type: 'SET_SUM_TYPE'; sumType: ActionType | 'all' }
  | { type: 'SET_SUM_PLAYER'; sumPlayer: string }
  | { type: 'SET_COPIED'; copied: boolean }
  | { type: 'OPEN_MATCH_MODAL' }
  | { type: 'CLOSE_MATCH_MODAL' }
  | { type: 'SAVE_MATCH_INFO'; date: string; local: string; visitante: string };

function nextDrag(prev: Drag | undefined, point: Point): Drag {
  return { x0: prev?.x0 ?? point.x, y0: prev?.y0 ?? point.y, x1: point.x, y1: point.y };
}

export function reducer(state: MatchState, action: Action): MatchState {
  switch (action.type) {
    case 'TICK':
      return state.running ? { ...state, seconds: state.seconds + 1 } : state;

    case 'ADVANCE': {
      switch (state.phase) {
        case 'pre':
          return { ...state, phase: '1H', running: true, half: 1 };
        case '1H':
          return { ...state, phase: 'ht', running: false };
        case 'ht':
          return { ...state, phase: '2H', running: true, half: 2 };
        case '2H':
          return { ...state, phase: 'ft', running: false };
        case 'ft':
          return { ...state, phase: 'end', running: false, showSummary: true, copied: false };
        case 'end':
          return { ...state, phase: 'pre', running: false, seconds: 0, half: 1, actions: [] };
        default:
          return state;
      }
    }

    case 'RESET_TIMER':
      return { ...state, running: false, seconds: 0, phase: 'pre', half: 1 };

    case 'SET_TIME':
      return { ...state, seconds: Math.max(0, Math.floor(action.seconds)) };

    case 'OPEN_MODAL':
      return {
        ...state,
        modalOpen: true,
        pendingType: action.actionType,
        selPlayer: null,
        assistPlayer: null,
        point: null,
        drag: null,
        shotDone: false,
        goalPoint: null,
        goalDrag: null,
        duelResult: null,
        shotType: null,
        note: '',
      };

    case 'CANCEL_MODAL':
      return { ...state, modalOpen: false, pendingType: null };

    case 'PITCH_DOWN':
      return {
        ...state,
        point: action.point,
        drag: nextDrag(undefined, action.point),
        shotDone: false,
        duelResult: null,
        shotType: null,
      };

    case 'PITCH_MOVE':
      if (!state.drag) return state;
      return { ...state, drag: nextDrag(state.drag, action.point) };

    case 'PITCH_UP': {
      if (!state.drag) return state;
      const dist = Math.hypot(state.drag.x1 - state.drag.x0, state.drag.y1 - state.drag.y0);
      return dist > 4 ? { ...state, shotDone: true } : state;
    }

    case 'GOAL_DOWN':
      return { ...state, goalPoint: action.point, goalDrag: nextDrag(undefined, action.point) };

    case 'GOAL_MOVE':
      if (!state.goalDrag) return state;
      return { ...state, goalDrag: nextDrag(state.goalDrag, action.point) };

    case 'SET_DUEL_RESULT':
      return { ...state, duelResult: action.result };

    case 'SET_SHOT_TYPE':
      return { ...state, shotType: action.shotType };

    case 'SELECT_ASSIST_PLAYER':
      return { ...state, assistPlayer: action.player };

    case 'CHANGE_ASSIST':
      return { ...state, assistPlayer: null };

    case 'SELECT_PLAYER':
      return { ...state, selPlayer: action.player };

    case 'CHANGE_PLAYER':
      return {
        ...state,
        selPlayer: null,
        point: null,
        drag: null,
        shotDone: false,
        duelResult: null,
        shotType: null,
      };

    case 'SET_NOTE':
      return { ...state, note: action.note };

    case 'SAVE_ACTION': {
      if (!state.pendingType || !state.selPlayer) return state;
      if (state.pendingType === 'tiro' && !state.duelResult) return state;
      const hasGoalStep = HAS_GOAL_STEP.includes(state.pendingType);
      if (hasGoalStep && !state.assistPlayer) return state;
      const newAction = {
        id: Date.now(),
        type: state.pendingType,
        seconds: state.seconds,
        player: state.selPlayer,
        assistPlayer: hasGoalStep ? state.assistPlayer : null,
        point: state.point,
        drag: state.drag,
        goalPoint: hasGoalStep ? state.goalPoint : null,
        goalDrag: hasGoalStep ? state.goalDrag : null,
        duelResult: state.pendingType === 'tiro' ? state.duelResult : null,
        shotType: hasGoalStep ? state.shotType : null,
        note: state.note.trim(),
      };
      return {
        ...state,
        actions: [...state.actions, newAction],
        modalOpen: false,
        pendingType: null,
      };
    }

    case 'DELETE_ACTION':
      return { ...state, actions: state.actions.filter((a) => a.id !== action.id) };

    case 'SET_TAB':
      return { ...state, tab: action.tab };

    case 'SET_ROSTER_FIELD':
      return {
        ...state,
        roster: state.roster.map((p) =>
          p.id === action.id
            ? { ...p, [action.field]: action.field === 'n' ? Number(action.value) || 0 : action.value }
            : p,
        ),
      };

    case 'SET_PHOTO':
      return {
        ...state,
        roster: state.roster.map((p) => (p.id === action.id ? { ...p, photo: action.photo } : p)),
      };

    case 'OPEN_SUMMARY':
      return { ...state, showSummary: true, copied: false };

    case 'CLOSE_SUMMARY':
      return { ...state, showSummary: false };

    case 'SET_SUM_TYPE':
      return { ...state, sumType: action.sumType };

    case 'SET_SUM_PLAYER':
      return { ...state, sumPlayer: action.sumPlayer };

    case 'SET_COPIED':
      return { ...state, copied: action.copied };

    case 'OPEN_MATCH_MODAL':
      return { ...state, matchModalOpen: true };

    case 'CLOSE_MATCH_MODAL':
      return { ...state, matchModalOpen: false };

    case 'SAVE_MATCH_INFO':
      return {
        ...state,
        matchDate: action.date,
        local: action.local,
        visitante: action.visitante,
        matchModalOpen: false,
      };

    default:
      return state;
  }
}
