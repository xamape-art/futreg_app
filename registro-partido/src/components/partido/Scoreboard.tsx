import { counters } from '../../selectors';
import type { MatchAction } from '../../types';

interface ScoreboardProps {
  actions: MatchAction[];
  size?: 'lg' | 'sm';
}

export function Scoreboard({ actions, size = 'lg' }: ScoreboardProps) {
  const chips = counters(actions);
  const numSize = size === 'lg' ? 'text-[26px]' : 'text-[24px]';

  return (
    <div className="grid grid-cols-4 gap-2 px-[18px]">
      {chips.map((c) => (
        <div key={c.key} className="rounded-[14px] border border-[#202632] bg-[#141922] px-1 py-[11px] text-center">
          <div className={`font-condensed font-extrabold leading-none ${numSize}`} style={{ color: c.color }}>
            {c.count}
          </div>
          <div className="mt-[3px] text-[10px] font-bold uppercase tracking-[.4px] text-[#8b93a0]">{c.short}</div>
        </div>
      ))}
    </div>
  );
}
