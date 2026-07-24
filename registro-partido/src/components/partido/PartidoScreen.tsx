import type { Action } from '../../state';
import type { ActionType, MatchState } from '../../types';
import { ActionButtons } from './ActionButtons';
import { Header } from './Header';
import { Scoreboard } from './Scoreboard';
import { Timeline } from './Timeline';
import { TimerCard } from './TimerCard';

interface PartidoScreenProps {
  state: MatchState;
  dispatch: React.Dispatch<Action>;
}

export function PartidoScreen({ state, dispatch }: PartidoScreenProps) {
  return (
    <div className="absolute inset-x-0 top-0 bottom-16 flex flex-col">
      <Header
        matchDate={state.matchDate}
        local={state.local}
        visitante={state.visitante}
        primary={state.primary}
        onOpenSummary={() => dispatch({ type: 'OPEN_SUMMARY' })}
        onOpenMatchModal={() => dispatch({ type: 'OPEN_MATCH_MODAL' })}
      />
      <TimerCard
        phase={state.phase}
        half={state.half}
        running={state.running}
        seconds={state.seconds}
        primary={state.primary}
        onAdvance={() => dispatch({ type: 'ADVANCE' })}
        onReset={() => dispatch({ type: 'RESET_TIMER' })}
        onSetTime={(seconds) => dispatch({ type: 'SET_TIME', seconds })}
      />
      <div className="pt-3.5 pb-1">
        <Scoreboard actions={state.actions} />
      </div>
      <ActionButtons onOpen={(type: ActionType) => dispatch({ type: 'OPEN_MODAL', actionType: type })} />
      <Timeline actions={state.actions} onDelete={(id) => dispatch({ type: 'DELETE_ACTION', id })} />
    </div>
  );
}
