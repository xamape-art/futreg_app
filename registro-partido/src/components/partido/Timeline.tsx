import { ACTION_META, DUEL_RESULT_META } from '../../constants';
import { minuteStr, playerLabel } from '../../selectors';
import type { MatchAction } from '../../types';

interface TimelineProps {
  actions: MatchAction[];
  onDelete: (id: number) => void;
}

export function Timeline({ actions, onDelete }: TimelineProps) {
  const items = actions.slice().reverse();

  return (
    <div className="mt-2 flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-[18px] pb-1.5 pt-1">
        <div className="text-[11px] font-bold uppercase tracking-[.6px] text-[#6b7280]">Timeline</div>
        <div className="text-[11px] font-semibold text-[#6b7280]">{actions.length} acciones</div>
      </div>
      <div className="flex-1 overflow-y-auto px-[18px] pb-6">
        {items.length === 0 && (
          <div className="px-3 py-[34px] text-center text-[13px] font-medium text-[#4c545f]">
            Aún no hay acciones.
            <br />
            Pulsa un botón para registrar la primera.
          </div>
        )}
        {items.map((t) => {
          const m = ACTION_META[t.type];
          return (
            <div
              key={t.id}
              className="animate-slideup flex items-start gap-[11px] border-b border-[#191e27] py-[11px]"
            >
              <div className="w-10 flex-none pt-px text-center font-condensed text-[17px] font-extrabold text-[#cfd5de]">
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
                  <span className="truncate text-[14px] font-bold text-[#eef1f5]">{playerLabel(t)}</span>
                  {t.assistPlayer && (
                    <span className="truncate text-[12px] font-semibold text-[#8b93a0]">
                      (asiste {t.assistPlayer.name} · {t.assistPlayer.n})
                    </span>
                  )}
                  {t.duelResult && (
                    <span
                      className="whitespace-nowrap rounded-[6px] px-[6px] py-[2px] font-condensed text-[10px] font-extrabold tracking-[.4px] text-white"
                      style={{ background: DUEL_RESULT_META[t.duelResult].color }}
                    >
                      {DUEL_RESULT_META[t.duelResult].label}
                    </span>
                  )}
                </div>
                {t.note && (
                  <div className="mt-[3px] text-[12.5px] leading-[1.35] text-[#8b93a0]">{t.note}</div>
                )}
              </div>
              <div
                onClick={() => onDelete(t.id)}
                className="flex h-6 w-6 flex-none cursor-pointer items-center justify-center rounded-[7px] text-[15px] text-[#5a626d] active:bg-[#1a1f28] active:text-[#E30613]"
              >
                ✕
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
