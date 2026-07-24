import { ACTION_META, ACTION_TYPES } from '../../constants';
import type { ActionType } from '../../types';

interface ActionButtonsProps {
  onOpen: (type: ActionType) => void;
}

export function ActionButtons({ onOpen }: ActionButtonsProps) {
  return (
    <div className="px-[18px] pb-1.5 pt-2.5">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[.6px] text-[#6b7280]">Registrar acción</div>
      <div className="grid grid-cols-2 gap-[9px]">
        {ACTION_TYPES.map((k) => {
          const m = ACTION_META[k];
          return (
            <div
              key={k}
              onClick={() => onOpen(k)}
              className="flex h-[58px] cursor-pointer items-center justify-center rounded-2xl text-white transition-transform duration-75 active:scale-[.96]"
              style={{ background: m.color, boxShadow: `0 6px 16px ${m.color}55` }}
            >
              <span className="font-condensed text-[17px] font-extrabold tracking-[.3px]">{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
