import { useRef } from 'react';
import type { Drag, Point } from '../../types';

interface GoalMouthProps {
  point: Point | null;
  drag: Drag | null;
  onGoalDown: (point: Point) => void;
  onGoalMove: (point: Point) => void;
}

function toPercent(e: React.PointerEvent, el: HTMLElement): Point {
  const r = el.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100;
  const y = ((e.clientY - r.top) / r.height) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

export function GoalMouth({ point, drag, onGoalDown, onGoalMove }: GoalMouthProps) {
  const draggingRef = useRef(false);

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = toPercent(e, e.currentTarget);
    draggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    onGoalDown(p);
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const p = toPercent(e, e.currentTarget);
    onGoalMove(p);
  };

  const handleUp = () => {
    draggingRef.current = false;
  };

  const dist = drag ? Math.hypot(drag.x1 - drag.x0, drag.y1 - drag.y0) : 0;
  const showArrow = !!drag && dist > 4;

  return (
    <div className="flex-none px-4 pb-1.5 pt-2.5">
      <div
        className="relative mx-auto w-full overflow-hidden rounded-[14px]"
        style={{
          aspectRatio: '2.6 / 1',
          background: 'linear-gradient(#151a22 0%, #151a22 70%, #1f9c4d 70%, #178040 100%)',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.5), 0 8px 24px rgba(0,0,0,.35)',
        }}
      >
        {/* grass stripes */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            top: '70%',
            background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 10%, transparent 10% 20%)',
          }}
        />

        {/* net mesh */}
        <div
          className="absolute"
          style={{
            left: '15%',
            right: '15%',
            top: '8%',
            height: '62%',
            backgroundColor: 'rgba(255,255,255,.05)',
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,.16) 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, rgba(255,255,255,.16) 0 1px, transparent 1px 9px)',
          }}
        />

        {/* posts + crossbar */}
        <div className="absolute" style={{ left: '15%', top: '8%', width: '1.1%', height: '62%', background: '#f5f7fa', borderRadius: 2 }} />
        <div className="absolute" style={{ right: '15%', top: '8%', width: '1.1%', height: '62%', background: '#f5f7fa', borderRadius: 2 }} />
        <div className="absolute" style={{ left: '15%', right: '15%', top: '8%', height: '3%', background: '#f5f7fa', borderRadius: 2 }} />

        {/* goal line */}
        <div className="absolute inset-x-0" style={{ top: '70%', height: 2, background: 'rgba(255,255,255,.85)' }} />

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
                    <marker id="gh" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#FFD400" />
                    </marker>
                  </defs>
                  <line
                    x1={drag.x0}
                    y1={drag.y0}
                    x2={drag.x1}
                    y2={drag.y1}
                    stroke="#FFD400"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                    markerEnd="url(#gh)"
                    vectorEffect="non-scaling-stroke"
                  />
                  <ellipse cx={drag.x0} cy={drag.y0} rx="1" ry="2.6" fill="#FFD400" />
                </>
              ) : (
                <ellipse cx={point.x} cy={point.y} rx="1.35" ry="3.5" fill="#FFD400" stroke="#111" strokeWidth="0.5" />
              )}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
