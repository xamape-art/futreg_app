import { DUEL_RESULT_META } from '../../constants';
import type { MatchAction } from '../../types';

interface DuelPitchMapProps {
  duels: MatchAction[];
}

const LINE_COLOR = 'rgba(255,255,255,.45)';

export function DuelPitchMap({ duels }: DuelPitchMapProps) {
  if (duels.length === 0) return null;

  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[.4px] text-[#7f8794]">Mapa de duelos</div>
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

        {duels.map((d) => {
          if (!d.point || !d.duelResult) return null;
          const meta = DUEL_RESULT_META[d.duelResult];
          return (
            <div
              key={d.id}
              title={`${d.player ? `${d.player.n} · ${d.player.name}` : 'Sin jugador'} · ${meta.label}`}
              className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-condensed text-[9px] font-extrabold text-white"
              style={{
                left: `${d.point.x}%`,
                top: `${d.point.y}%`,
                background: meta.color,
                borderColor: 'rgba(255,255,255,.85)',
                boxShadow: '0 1px 4px rgba(0,0,0,.4)',
              }}
            >
              {d.player?.n ?? ''}
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: DUEL_RESULT_META.ganado.color }} />
          <span className="text-[10px] font-semibold text-[#8b93a0]">Ganado</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: DUEL_RESULT_META.perdido.color }} />
          <span className="text-[10px] font-semibold text-[#8b93a0]">Perdido</span>
        </div>
      </div>
    </div>
  );
}
