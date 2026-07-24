import { SHOT_TYPE_META } from '../../constants';
import type { MatchAction, ShotType } from '../../types';

interface ShotTrajectoryMapProps {
  title: string;
  shots: MatchAction[];
}

const LINE_COLOR = 'rgba(255,255,255,.45)';
const DEFAULT_COLOR = '#8b93a0';

export function ShotTrajectoryMap({ title, shots }: ShotTrajectoryMapProps) {
  const marked = shots.filter((s) => s.point);
  if (marked.length === 0) return null;

  const usedTypes = Array.from(
    new Set(marked.map((s) => s.shotType).filter((t): t is ShotType => t !== null)),
  );

  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[.4px] text-[#7f8794]">{title}</div>
      <div
        className="relative h-[220px] overflow-hidden rounded-[14px]"
        style={{
          background: 'linear-gradient(#1f9c4d,#178040)',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.5)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'repeating-linear-gradient(180deg, rgba(255,255,255,.06) 0 9%, transparent 9% 18%)' }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ borderColor: LINE_COLOR }}
        />
        <div className="absolute inset-x-0 top-1/2 h-[2px]" style={{ background: LINE_COLOR }} />
        <div
          className="absolute left-[22%] right-[22%] top-0 h-[15%] border-2 border-t-0"
          style={{ borderColor: LINE_COLOR }}
        />
        <div
          className="absolute left-[35%] right-[35%] top-0 h-[6%] border-2 border-t-0"
          style={{ borderColor: LINE_COLOR }}
        />
        <div
          className="absolute bottom-0 left-[22%] right-[22%] h-[15%] border-2 border-b-0"
          style={{ borderColor: LINE_COLOR }}
        />
        <div
          className="absolute bottom-0 left-[35%] right-[35%] h-[6%] border-2 border-b-0"
          style={{ borderColor: LINE_COLOR }}
        />

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-[1] h-full w-full">
          <defs>
            {marked.map((s) => (
              <marker key={s.id} id={`shot-arrow-${s.id}`} markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={s.shotType ? SHOT_TYPE_META[s.shotType].color : DEFAULT_COLOR} />
              </marker>
            ))}
          </defs>
          {marked.map((s) => {
            if (!s.drag) return null;
            const dist = Math.hypot(s.drag.x1 - s.drag.x0, s.drag.y1 - s.drag.y0);
            if (dist <= 4) return null;
            const color = s.shotType ? SHOT_TYPE_META[s.shotType].color : DEFAULT_COLOR;
            return (
              <line
                key={s.id}
                x1={s.drag.x0}
                y1={s.drag.y0}
                x2={s.drag.x1}
                y2={s.drag.y1}
                stroke={color}
                strokeWidth="1.1"
                strokeLinecap="round"
                markerEnd={`url(#shot-arrow-${s.id})`}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 z-[2]">
          {marked.map((s) => {
            const color = s.shotType ? SHOT_TYPE_META[s.shotType].color : DEFAULT_COLOR;
            const origin = s.drag ? { x: s.drag.x0, y: s.drag.y0 } : s.point!;
            return (
              <div
                key={s.id}
                title={`${s.player ? `${s.player.n} · ${s.player.name}` : 'Sin jugador'}${s.shotType ? ` · ${SHOT_TYPE_META[s.shotType].label}` : ''}`}
                className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-condensed text-[9px] font-extrabold text-white"
                style={{
                  left: `${origin.x}%`,
                  top: `${origin.y}%`,
                  background: color,
                  borderColor: 'rgba(255,255,255,.85)',
                  boxShadow: '0 1px 4px rgba(0,0,0,.4)',
                }}
              >
                {s.player?.n ?? ''}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
        {usedTypes.map((t) => (
          <div key={t} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: SHOT_TYPE_META[t].color }} />
            <span className="text-[10px] font-semibold text-[#8b93a0]">{SHOT_TYPE_META[t].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
