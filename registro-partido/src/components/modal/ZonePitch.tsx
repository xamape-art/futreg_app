import { useRef } from 'react';
import { DUEL_RESULT_META, SHOT_TYPE_META, SHOT_TYPES } from '../../constants';
import type { Drag, DuelResult, Player, PlayerRef, Point, ShotType } from '../../types';

interface ZonePitchProps {
  roster: Player[];
  selPlayer: PlayerRef | null;
  point: Point | null;
  drag: Drag | null;
  onPitchDown: (point: Point) => void;
  onPitchMove: (point: Point) => void;
  onPitchUp?: () => void;
  showResultPicker?: boolean;
  result?: DuelResult | null;
  onResult?: (result: DuelResult) => void;
  showShotTypePicker?: boolean;
  shotDone?: boolean;
  shotType?: ShotType | null;
  onShotType?: (shotType: ShotType) => void;
}

// 12 zonas: 4 columnas x 3 filas. Filas de arriba a abajo; la 1 queda abajo-izda
// y la numeración crece hacia la derecha y hacia arriba.
const COLS = 4;
const ROWS = 3;
const ZONE_ROWS = [
  [9, 10, 11, 12],
  [5, 6, 7, 8],
  [1, 2, 3, 4],
];
const ROW_LINES = Array.from({ length: ROWS - 1 }, (_, i) => ((i + 1) * 100) / ROWS);
const COL_LINES = Array.from({ length: COLS - 1 }, (_, i) => ((i + 1) * 100) / COLS);

function toPercent(e: React.PointerEvent, el: HTMLElement): Point {
  const r = el.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100;
  const y = ((e.clientY - r.top) / r.height) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

export function ZonePitch({
  roster,
  selPlayer,
  point,
  drag,
  onPitchDown,
  onPitchMove,
  onPitchUp,
  showResultPicker,
  result,
  onResult,
  showShotTypePicker,
  shotDone,
  shotType,
  onShotType,
}: ZonePitchProps) {
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
    onPitchUp?.();
  };

  const dist = drag ? Math.hypot(drag.x1 - drag.x0, drag.y1 - drag.y0) : 0;
  const showArrow = !!drag && dist > 4 && !showResultPicker;

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
        <div
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'rgba(255,255,255,.6)' }}
        />
        <div
          className="absolute left-[35%] right-[35%] top-0 h-[6%] border-2 border-t-0"
          style={{ borderColor: 'rgba(255,255,255,.45)' }}
        />
        <div
          className="absolute bottom-0 left-[35%] right-[35%] h-[6%] border-2 border-b-0"
          style={{ borderColor: 'rgba(255,255,255,.45)' }}
        />

        {/* zone grid: 12 zones (4 columnas x 3 filas), líneas equidistantes */}
        <div className="pointer-events-none absolute inset-0 z-[1]">
          {ROW_LINES.map((topPct) => (
            <div
              key={`h${topPct}`}
              className="absolute left-0 right-0 h-px"
              style={{ top: `${topPct.toFixed(4)}%`, background: 'rgba(255,255,255,.55)' }}
            />
          ))}
          {COL_LINES.map((leftPct) => (
            <div
              key={`v${leftPct}`}
              className="absolute top-0 bottom-0 w-px"
              style={{ left: `${leftPct.toFixed(4)}%`, background: 'rgba(255,255,255,.55)' }}
            />
          ))}
        </div>

        {/* zone numbers: 1 abajo-izda → 12 arriba-dcha */}
        <div className="pointer-events-none absolute inset-0 z-[1]">
          {ZONE_ROWS.map((row, rIdx) =>
            row.map((zone, cIdx) => (
              <div
                key={zone}
                className="absolute flex items-center justify-center font-condensed text-[15px] font-extrabold"
                style={{
                  left: `${((cIdx * 100) / COLS).toFixed(4)}%`,
                  top: `${((rIdx * 100) / ROWS).toFixed(4)}%`,
                  width: `${(100 / COLS).toFixed(4)}%`,
                  height: `${(100 / ROWS).toFixed(4)}%`,
                  color: 'rgba(255,255,255,.4)',
                }}
              >
                {zone}
              </div>
            )),
          )}
        </div>

        {/* interaction layer */}
        <div
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          className="absolute inset-0 z-[2] cursor-crosshair"
          style={{ touchAction: 'none' }}
        />

        {/* overlay: point + arrow */}
        <div className="pointer-events-none absolute inset-0 z-[3]">
          {point && (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
              {showArrow && drag ? (
                <>
                  <defs>
                    <marker id="zh" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
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
                    markerEnd="url(#zh)"
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

        {/* resultado del duelo: embebido junto a la zona marcada */}
        {point && showResultPicker && onResult && (
          <div
            className="absolute z-[5] flex gap-[6px]"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: `translate(${point.x < 20 ? '0%' : point.x > 80 ? '-100%' : '-50%'}, ${point.y > 25 ? 'calc(-100% - 14px)' : '14px'})`,
            }}
          >
            {(Object.keys(DUEL_RESULT_META) as DuelResult[]).map((key) => {
              const meta = DUEL_RESULT_META[key];
              const active = result === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onResult(key)}
                  className="whitespace-nowrap rounded-full px-3 py-[6px] font-condensed text-[12px] font-extrabold tracking-[.4px] text-white shadow-[0_4px_10px_rgba(0,0,0,.4)]"
                  style={{
                    background: active ? meta.color : 'rgba(17,20,26,.85)',
                    border: `1.5px solid ${meta.color}`,
                    opacity: active ? 1 : 0.85,
                  }}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        )}

        {/* tipo de remate: desplegable al finalizar la línea, antes de pasar a la portería */}
        {showShotTypePicker && shotDone && !shotType && drag && onShotType && (
          <div
            className="absolute z-[6] flex flex-col overflow-hidden rounded-[10px] shadow-[0_4px_14px_rgba(0,0,0,.45)]"
            style={{
              left: `${drag.x1}%`,
              top: `${drag.y1}%`,
              transform: `translate(${drag.x1 < 20 ? '0%' : drag.x1 > 80 ? '-100%' : '-50%'}, ${drag.y1 > 25 ? 'calc(-100% - 14px)' : '14px'})`,
              border: '1.5px solid rgba(255,255,255,.35)',
              minWidth: 132,
            }}
          >
            {SHOT_TYPES.map((key, i) => (
              <button
                key={key}
                type="button"
                onClick={() => onShotType(key)}
                className="whitespace-nowrap px-3 py-[9px] text-left font-condensed text-[13px] font-extrabold tracking-[.3px] text-white"
                style={{
                  background: 'rgba(17,20,26,.92)',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,.12)',
                }}
              >
                {SHOT_TYPE_META[key].label}
              </button>
            ))}
          </div>
        )}

        {/* players (visuales, no interactivos) */}
        <div className="pointer-events-none absolute inset-0 z-[4]">
          {roster.map((p) => {
            const sel = selPlayer?.id === p.id;
            return (
              <div
                key={p.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 font-condensed text-[13px] font-extrabold bg-cover bg-center"
                  style={{
                    color: sel ? '#111' : '#fff',
                    backgroundColor: p.photo ? '#000' : sel ? '#FFD400' : 'rgba(20,24,30,.6)',
                    backgroundImage: p.photo ? `url(${p.photo})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderColor: sel ? '#FFD400' : 'rgba(255,255,255,.55)',
                    boxShadow: sel ? '0 0 0 4px rgba(255,212,0,.45)' : '0 2px 6px rgba(0,0,0,.4)',
                    opacity: sel ? 1 : 0.6,
                  }}
                >
                  {!p.photo && p.n}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
