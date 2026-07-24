import { formatMatchDate } from '../../selectors';

interface HeaderProps {
  matchDate: string;
  local: string;
  visitante: string;
  primary: string;
  onOpenSummary: () => void;
  onOpenMatchModal: () => void;
}

export function Header({ matchDate, local, visitante, primary, onOpenSummary, onOpenMatchModal }: HeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-[22px] pb-[14px]"
      style={{ paddingTop: 52, background: 'linear-gradient(180deg,#151a22,#10131a)' }}
    >
      <div className="flex items-center gap-[10px] min-w-0">
        <div
          className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] font-condensed text-[18px] font-extrabold text-white"
          style={{ background: primary }}
        >
          {local.charAt(0)}
        </div>
        <div className="min-w-0 cursor-pointer" onClick={onOpenMatchModal}>
          <div className="truncate text-[15px] font-bold leading-[1.05]">{local}</div>
          <div className="truncate text-[11px] font-medium text-[#7f8794]">
            {formatMatchDate(matchDate)} · vs {visitante}
          </div>
        </div>
      </div>
      <div
        onClick={onOpenSummary}
        className="flex-none cursor-pointer rounded-[20px] border border-[#2b3038] px-3 py-2 text-[12px] font-bold text-[#aeb6c2] active:bg-[#1a1f28]"
      >
        Resumen
      </div>
    </div>
  );
}
