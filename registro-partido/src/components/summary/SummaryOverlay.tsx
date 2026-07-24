import { ACTION_META, ACTION_TYPES } from '../../constants';
import { buildSummaryText, formatMatchDate, minuteStr, playerLabel } from '../../selectors';
import type { Action } from '../../state';
import type { ActionType, MatchState } from '../../types';
import { Scoreboard } from '../partido/Scoreboard';
import { SummaryCharts } from './SummaryCharts';

interface SummaryOverlayProps {
  state: MatchState;
  dispatch: React.Dispatch<Action>;
  onCopy: () => void;
}

function eventChipClass(active: boolean) {
  return active ? 'text-white' : 'border border-[#2b3038] text-[#aeb6c2]';
}

export function SummaryOverlay({ state, dispatch, onCopy }: SummaryOverlayProps) {
  if (!state.showSummary) return null;

  const filtered = state.actions
    .filter((a) => state.sumType === 'all' || a.type === state.sumType)
    .filter((a) => state.sumPlayer === 'all' || (a.player && String(a.player.id) === state.sumPlayer))
    .slice()
    .reverse();

  const handleCopy = () => {
    const text = buildSummaryText(state);
    try {
      navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    onCopy();
  };

  return (
    <div className="animate-slideup-modal absolute inset-0 z-30 flex flex-col bg-[#0c0f14]">
      <div className="flex items-center justify-between border-b border-[#191e27] px-[18px] pb-3 pt-[50px]">
        <div>
          <div className="font-condensed text-[19px] font-extrabold">Resumen del partido</div>
          <div className="text-[12px] font-medium text-[#7f8794]">
            {state.local} · vs {state.visitante} · {formatMatchDate(state.matchDate)} · {minuteStr(state.seconds)}
          </div>
        </div>
        <div
          onClick={() => dispatch({ type: 'CLOSE_SUMMARY' })}
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] border border-[#2b3038] text-[17px] text-[#aeb6c2] active:bg-[#1a1f28]"
        >
          ✕
        </div>
      </div>

      <div className="px-[18px] py-3.5">
        <Scoreboard actions={state.actions} size="sm" />
      </div>

      <div className="flex gap-[7px] overflow-x-auto px-[18px] pb-2.5 pt-0.5">
        <div
          onClick={() => dispatch({ type: 'SET_SUM_TYPE', sumType: 'all' })}
          className={`cursor-pointer whitespace-nowrap rounded-[20px] px-[11px] py-1.5 text-[11.5px] font-bold ${eventChipClass(state.sumType === 'all')}`}
          style={{ background: state.sumType === 'all' ? '#5a6470' : undefined }}
        >
          Todos
        </div>
        {ACTION_TYPES.map((k: ActionType) => {
          const m = ACTION_META[k];
          const active = state.sumType === k;
          return (
            <div
              key={k}
              onClick={() => dispatch({ type: 'SET_SUM_TYPE', sumType: k })}
              className={`cursor-pointer whitespace-nowrap rounded-[20px] px-[11px] py-1.5 text-[11.5px] font-bold ${eventChipClass(active)}`}
              style={{ background: active ? m.color : undefined, borderColor: active ? m.color : undefined }}
            >
              {m.label}
            </div>
          );
        })}
      </div>

      <div className="px-[18px] pb-2">
        <select
          value={state.sumPlayer}
          onChange={(e) => dispatch({ type: 'SET_SUM_PLAYER', sumPlayer: e.target.value })}
          className="h-10 w-full rounded-[11px] border border-[#262c37] bg-[#161b23] px-3 text-[14px] font-semibold text-[#eef1f5] outline-none"
        >
          <option value="all">Todos los jugadores</option>
          {state.roster.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.n} · {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto px-[18px] pb-3 pt-0.5">
        <SummaryCharts actions={filtered} totalSeconds={state.seconds} sumType={state.sumType} />
        {filtered.length === 0 && (
          <div className="px-3 py-7 text-center text-[13px] font-medium text-[#4c545f]">
            Sin acciones para este filtro.
          </div>
        )}
        {filtered.map((t) => {
          const m = ACTION_META[t.type];
          return (
            <div key={t.id} className="flex gap-[11px] border-b border-[#191e27] py-2.5">
              <div className="w-10 flex-none text-center font-condensed text-[16px] font-extrabold text-[#cfd5de]">
                {minuteStr(t.seconds)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-[7px]">
                  <span
                    className="whitespace-nowrap rounded-[6px] px-2 py-[3px] font-condensed text-[11px] font-extrabold tracking-[.4px] text-white"
                    style={{ background: m.color }}
                  >
                    {m.label}
                  </span>
                  <span className="truncate text-[14px] font-bold">{playerLabel(t)}</span>
                </div>
                {t.note && <div className="mt-[3px] text-[12.5px] text-[#8b93a0]">{t.note}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#191e27] bg-[#0c0f14] px-[18px] pb-[26px] pt-2">
        <div
          onClick={handleCopy}
          className="flex h-[52px] cursor-pointer items-center justify-center rounded-[14px] text-[15px] font-extrabold"
          style={{ color: state.copied ? '#111' : '#fff', background: state.copied ? '#4ade80' : state.primary }}
        >
          {state.copied ? '¡Copiado!' : 'Copiar resumen'}
        </div>
      </div>
    </div>
  );
}
