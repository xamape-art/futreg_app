import { ACTION_META, HAS_GOAL_STEP } from '../../constants';
import { minuteStr } from '../../selectors';
import type { Action } from '../../state';
import type { MatchState } from '../../types';
import { GoalMouth } from './GoalMouth';
import { Pitch } from './Pitch';
import { ZonePitch } from './ZonePitch';

interface AssignModalProps {
  state: MatchState;
  dispatch: React.Dispatch<Action>;
}

export function AssignModal({ state, dispatch }: AssignModalProps) {
  if (!state.modalOpen || !state.pendingType) return null;

  const meta = ACTION_META[state.pendingType];
  const isDuelo = state.pendingType === 'tiro';
  const hasGoalStep = HAS_GOAL_STEP.includes(state.pendingType);
  const awaitingAssist = hasGoalStep && !state.assistPlayer;
  const canSave =
    !!state.selPlayer && (!isDuelo || !!state.duelResult) && (!hasGoalStep || !!state.assistPlayer);

  return (
    <div className="animate-slideup-modal absolute inset-0 z-20 flex flex-col bg-[#0c0f14]">
      <div className="flex items-center justify-between px-[18px] pb-3 pt-[50px]">
        <div className="flex items-center gap-[9px]">
          <span
            className="whitespace-nowrap rounded-[6px] px-2 py-[3px] font-condensed text-[11px] font-extrabold tracking-[.4px] text-white"
            style={{ background: meta.color }}
          >
            {meta.label}
          </span>
          <span className="font-condensed text-[18px] font-extrabold">{minuteStr(state.seconds)}</span>
        </div>
        <div
          onClick={() => dispatch({ type: 'CANCEL_MODAL' })}
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] border border-[#2b3038] text-[17px] text-[#aeb6c2] active:bg-[#1a1f28]"
        >
          ✕
        </div>
      </div>
      <div className="flex items-center justify-between px-[18px] pb-1">
        <div className="animate-blink-highlight rounded-[6px] px-2 py-[3px] text-[12px] font-bold text-white">
          {awaitingAssist
            ? '¿Quién asiste?'
            : !state.selPlayer
              ? hasGoalStep
                ? '¿Quién finaliza?'
                : 'Toca al jugador para empezar'
              : hasGoalStep
                ? !state.shotDone
                  ? '¿Cuál es la trayectoria?'
                  : !state.shotType
                    ? 'Selecciona el tipo de remate'
                    : 'Marca por dónde entra en la portería'
                : isDuelo && state.point && !state.duelResult
                  ? 'Indica si el duelo se ha ganado o perdido'
                  : 'Marca la zona · arrastra para la trayectoria'}
        </div>
        {state.selPlayer ? (
          <div
            onClick={() => dispatch({ type: 'CHANGE_PLAYER' })}
            className="animate-blink-highlight cursor-pointer whitespace-nowrap rounded-[6px] px-2 py-[3px] text-[12px] font-bold text-white active:text-[#aeb6c2]"
          >
            Cambiar jugador
          </div>
        ) : (
          state.assistPlayer && (
            <div
              onClick={() => dispatch({ type: 'CHANGE_ASSIST' })}
              className="animate-blink-highlight cursor-pointer whitespace-nowrap rounded-[6px] px-2 py-[3px] text-[12px] font-bold text-white active:text-[#aeb6c2]"
            >
              Cambiar asistencia
            </div>
          )
        )}
      </div>

      {awaitingAssist ? (
        <Pitch
          roster={state.roster}
          primary={state.primary}
          selPlayer={null}
          point={state.point}
          drag={state.drag}
          onPitchDown={(point) => dispatch({ type: 'PITCH_DOWN', point })}
          onPitchMove={(point) => dispatch({ type: 'PITCH_MOVE', point })}
          onSelectPlayer={(player) => dispatch({ type: 'SELECT_ASSIST_PLAYER', player })}
        />
      ) : !state.selPlayer ? (
        <Pitch
          roster={state.roster}
          primary={state.primary}
          selPlayer={state.selPlayer}
          assistPlayer={state.assistPlayer}
          point={state.point}
          drag={state.drag}
          onPitchDown={(point) => dispatch({ type: 'PITCH_DOWN', point })}
          onPitchMove={(point) => dispatch({ type: 'PITCH_MOVE', point })}
          onSelectPlayer={(player) => dispatch({ type: 'SELECT_PLAYER', player })}
        />
      ) : hasGoalStep ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <ZonePitch
            roster={state.roster}
            selPlayer={state.selPlayer}
            point={state.point}
            drag={state.drag}
            onPitchDown={(point) => dispatch({ type: 'PITCH_DOWN', point })}
            onPitchMove={(point) => dispatch({ type: 'PITCH_MOVE', point })}
            onPitchUp={() => dispatch({ type: 'PITCH_UP' })}
            showShotTypePicker
            shotDone={state.shotDone}
            shotType={state.shotType}
            onShotType={(shotType) => dispatch({ type: 'SET_SHOT_TYPE', shotType })}
          />
          {state.shotDone && state.shotType && (
            <GoalMouth
              point={state.goalPoint}
              drag={state.goalDrag}
              onGoalDown={(point) => dispatch({ type: 'GOAL_DOWN', point })}
              onGoalMove={(point) => dispatch({ type: 'GOAL_MOVE', point })}
            />
          )}
        </div>
      ) : (
        <ZonePitch
          roster={state.roster}
          selPlayer={state.selPlayer}
          point={state.point}
          drag={state.drag}
          onPitchDown={(point) => dispatch({ type: 'PITCH_DOWN', point })}
          onPitchMove={(point) => dispatch({ type: 'PITCH_MOVE', point })}
          showResultPicker={isDuelo}
          result={state.duelResult}
          onResult={(result) => dispatch({ type: 'SET_DUEL_RESULT', result })}
        />
      )}

      <div className="bg-[#0c0f14] px-[18px] pb-[26px] pt-2">
        <div
          className="text-center text-[12.5px] font-semibold"
          style={{ color: canSave ? '#4ade80' : '#7f8794' }}
        >
          {canSave
            ? hasGoalStep
              ? `Asiste: ${state.assistPlayer!.name} · ${state.assistPlayer!.n} → Finaliza: ${state.selPlayer!.name} · ${state.selPlayer!.n}`
              : `Jugador: ${state.selPlayer!.name} · ${state.selPlayer!.n}`
            : awaitingAssist
              ? 'Selecciona quién asiste'
              : !state.selPlayer
                ? 'Selecciona un jugador para guardar'
                : 'Marca GANADO o PÉRDIDO para guardar'}
        </div>
        <textarea
          value={state.note}
          onChange={(e) => dispatch({ type: 'SET_NOTE', note: e.target.value })}
          placeholder="Notas (opcional): descripción, contexto…"
          className="my-2.5 h-[52px] w-full resize-none rounded-xl border border-[#262c37] bg-[#161b23] px-3 py-2.5 text-[13.5px] text-[#eef1f5] outline-none focus:border-[#3a424f]"
        />
        <div className="flex gap-2.5">
          <div
            onClick={() => dispatch({ type: 'CANCEL_MODAL' })}
            className="flex h-[50px] w-[108px] flex-none cursor-pointer items-center justify-center rounded-[14px] border border-[#2b3038] font-bold text-[#aeb6c2] active:bg-[#1a1f28]"
          >
            Cancelar
          </div>
          <div
            onClick={() => canSave && dispatch({ type: 'SAVE_ACTION' })}
            className="flex h-[50px] flex-1 items-center justify-center rounded-[14px] text-[15px] font-extrabold text-white"
            style={{
              background: canSave ? state.primary : '#39404b',
              opacity: canSave ? 1 : 0.7,
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            Guardar acción
          </div>
        </div>
      </div>
    </div>
  );
}
