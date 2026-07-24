import { useRef } from 'react';
import type { Drag, Player, PlayerRef, Point } from '../../types';

const ASSIST_COLOR = '#2F80ED';

interface PitchProps {
  roster: Player[];
  primary: string;
  selPlayer: PlayerRef | null;
  assistPlayer?: PlayerRef | null;
  point: Point | null;
  drag: Drag | null;
  onPitchDown: (point: Point) => void;
  onPitchMove: (point: Point) => void;
  onSelectPlayer: (player: PlayerRef) => void;
}

function toPercent(e: React.PointerEvent, el: HTMLElement): Point {
  const r = el.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100;
  const y = ((e.clientY - r.top) / r.height) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

export function Pitch({ roster, primary, selPlayer, assistPlayer, point, drag, onPitchDown, onPitchMove, onSelectPlayer }: PitchProps) {
  const draggingRef = useRef(false);

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = toPercent(e, e.currentTarget);
    draggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    onPitchDown(p);
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const p = toPercent(e, e.currentTarget);
    onPitchMove(p);
  };

  const handleUp = () => {
    draggingRef.current = false;
  };

  const dist = drag ? Math.hypot(drag.x1 - drag.x0, drag.y1 - drag.y0) : 0;
  const showArrow = !!drag && dist > 4;

  return (
    <div className="flex min-h-0 flex-1 items-stretch px-4 pb-1.5 pt-2.5">
      <div
        className="relative flex-1 overflow-hidden rounded-[14px]"
        style={{
          background: 'linear-gradient(#1f9c4d,#178040)',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.5), 0 8px 24px rgba(0,0,0,.35)',
        }}
      >
        {/* stripes */}
        <div
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(180deg, rgba(255,255,255,.06) 0 9%, transparent 9% 18%)',
          }}
        />
        {/* markings */}
        <div
          className="absolute left-1/2 top-1/2 h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ borderColor: 'rgba(255,255,255,.45)' }}
        />
        <div className="absolute inset-x-0 top-1/2 h-[2px]" style={{ background: 'rgba(255,255,255,.45)' }} />
        <div
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'rgba(255,255,255,.6)' }}
        />
        <div
          className="absolute left-[22%] right-[22%] top-0 h-[15%] border-2 border-t-0"
          style={{ borderColor: 'rgba(255,255,255,.45)' }}
        />
        <div
          className="absolute left-[35%] right-[35%] top-0 h-[6%] border-2 border-t-0"
          style={{ borderColor: 'rgba(255,255,255,.45)' }}
        />
        <div
          className="absolute bottom-0 left-[22%] right-[22%] h-[15%] border-2 border-b-0"
          style={{ borderColor: 'rgba(255,255,255,.45)' }}
        />
        <div
          className="absolute bottom-0 left-[35%] right-[35%] h-[6%] border-2 border-b-0"
          style={{ borderColor: 'rgba(255,255,255,.45)' }}
        />

        {/* interaction layer */}
        <div
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          className="absolute inset-0 z-[1] cursor-crosshair"
          style={{ touchAction: 'none' }}
        />

        {/* overlay: point + arrow */}
        <div className="pointer-events-none absolute inset-0 z-[2]">
          {point && (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
              {showArrow && drag ? (
                <>
                  <defs>
                    <marker id="ah" markerWidth="7" markerHeight="7" refX="4.5" refY="3.5" orient="auto">
                      <path d="M0,0 L7,3.5 L0,7 Z" fill="#FFD400" />
                    </marker>
                  </defs>
                  <line
                    x1={drag.x0}
                    y1={drag.y0}
                    x2={drag.x1}
                    y2={drag.y1}
                    stroke="#FFD400"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    markerEnd="url(#ah)"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx={drag.x0} cy={drag.y0} r="1.3" fill="#FFD400" />
                </>
              ) : (
                <circle cx={point.x} cy={point.y} r="1.8" fill="#FFD400" stroke="#111" strokeWidth="0.5" />
              )}
            </svg>
          )}
        </div>

        {/* players */}
        {roster.map((p) => {
          const sel = selPlayer?.id === p.id;
          const isAssist = !sel && assistPlayer?.id === p.id;
          return (
            <div
              key={p.id}
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelectPlayer({ id: p.id, n: p.n, name: p.name });
              }}
              className="absolute z-[3] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none', cursor: 'pointer' }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 font-condensed text-[15px] font-extrabold bg-cover bg-center"
                style={{
                  color: sel ? '#111' : '#fff',
                  backgroundColor: p.photo ? '#000' : sel ? '#FFD400' : isAssist ? ASSIST_COLOR : primary,
                  backgroundImage: p.photo ? `url(${p.photo})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderColor: sel ? '#FFD400' : isAssist ? ASSIST_COLOR : 'rgba(255,255,255,.85)',
                  boxShadow: sel
                    ? '0 0 0 4px rgba(255,212,0,.45)'
                    : isAssist
                      ? '0 0 0 4px rgba(47,128,237,.45)'
                      : '0 2px 6px rgba(0,0,0,.4)',
                }}
              >
                {!p.photo && p.n}
              </div>
              <div
                className="mt-[3px] whitespace-nowrap text-[9.5px] font-bold text-white"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,.7)' }}
              >
                {p.n} {p.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
