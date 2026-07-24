import { ACTION_META, ACTION_TYPES, DUEL_RESULT_META } from '../../constants';
import { counters, duelsByPlayer, shotTypeBreakdown, timelineBuckets, topPlayers } from '../../selectors';
import type { ActionType, MatchAction } from '../../types';
import { DuelPitchMap } from './DuelPitchMap';
import { ShotTrajectoryMap } from './ShotTrajectoryMap';

interface SummaryChartsProps {
  actions: MatchAction[];
  totalSeconds: number;
  sumType: ActionType | 'all';
}

export function SummaryCharts({ actions, totalSeconds, sumType }: SummaryChartsProps) {
  if (actions.length === 0) return null;

  const visibleTypes = sumType === 'all' ? ACTION_TYPES : [sumType];

  const chips = counters(actions).filter((c) => visibleTypes.includes(c.key));
  const maxCount = Math.max(1, ...chips.map((c) => c.count));

  const buckets = timelineBuckets(actions, totalSeconds);
  const maxBucketTotal = Math.max(1, ...buckets.map((b) => b.total));

  const players = topPlayers(actions);
  const maxPlayerCount = Math.max(1, ...players.map((p) => p.count));

  const duels = duelsByPlayer(actions);
  const duelActions = actions.filter((a) => a.type === 'tiro' && a.point && a.duelResult);

  const golShotTypes = shotTypeBreakdown(actions, 'gol').filter((s) => s.count > 0);
  const ocasionShotTypes = shotTypeBreakdown(actions, 'ocasion').filter((s) => s.count > 0);

  return (
    <div className="mb-4 flex flex-col gap-5 border-b border-[#191e27] pb-4">
      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[.4px] text-[#7f8794]">
          Distribución por tipo
        </div>
        <div className="flex flex-col gap-2">
          {chips.map((c) => (
            <div key={c.key} className="flex items-center gap-2">
              <div className="w-[74px] flex-none truncate text-[11.5px] font-bold text-[#aeb6c2]">{c.short}</div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#161b23]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(c.count / maxCount) * 100}%`, background: c.color }}
                />
              </div>
              <div className="w-6 flex-none text-right text-[12px] font-extrabold" style={{ color: c.color }}>
                {c.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {golShotTypes.length > 0 && (
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[.4px] text-[#7f8794]">
            Tipología de goles
          </div>
          <div className="flex flex-col gap-2">
            {golShotTypes.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className="w-[100px] flex-none truncate text-[11.5px] font-bold text-[#aeb6c2]">{s.label}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#161b23]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(s.count / Math.max(1, ...golShotTypes.map((g) => g.count))) * 100}%`,
                      background: ACTION_META.gol.color,
                    }}
                  />
                </div>
                <div className="w-6 flex-none text-right text-[12px] font-extrabold" style={{ color: ACTION_META.gol.color }}>
                  {s.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ShotTrajectoryMap title="Trayectorias de gol" shots={actions.filter((a) => a.type === 'gol')} />

      {ocasionShotTypes.length > 0 && (
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[.4px] text-[#7f8794]">
            Tipología de ocasiones
          </div>
          <div className="flex flex-col gap-2">
            {ocasionShotTypes.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className="w-[100px] flex-none truncate text-[11.5px] font-bold text-[#aeb6c2]">{s.label}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#161b23]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(s.count / Math.max(1, ...ocasionShotTypes.map((o) => o.count))) * 100}%`,
                      background: ACTION_META.ocasion.color,
                    }}
                  />
                </div>
                <div
                  className="w-6 flex-none text-right text-[12px] font-extrabold"
                  style={{ color: ACTION_META.ocasion.color }}
                >
                  {s.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ShotTrajectoryMap title="Trayectorias de ocasión" shots={actions.filter((a) => a.type === 'ocasion')} />

      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[.4px] text-[#7f8794]">Eventos por franja</div>
        <div className="flex items-start gap-[5px]">
          {buckets.map((b) => (
            <div key={b.label} className="flex flex-1 flex-col items-center">
              <div className="flex h-[78px] w-full flex-col-reverse items-stretch gap-[2px] overflow-hidden rounded-[4px] bg-[#12161d]">
                {visibleTypes.map((t) =>
                  b.counts[t] > 0 ? (
                    <div
                      key={t}
                      title={`${ACTION_META[t].short}: ${b.counts[t]}`}
                      style={{ height: `${(b.counts[t] / maxBucketTotal) * 72}px`, background: ACTION_META[t].color }}
                    />
                  ) : null,
                )}
              </div>
              <div className="mt-1 text-[9px] font-semibold text-[#5b6270]">{b.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
          {visibleTypes.map((t) => (
            <div key={t} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: ACTION_META[t].color }} />
              <span className="text-[10px] font-semibold text-[#8b93a0]">{ACTION_META[t].short}</span>
            </div>
          ))}
        </div>
      </div>

      {players.length > 0 && (
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[.4px] text-[#7f8794]">Top jugadores</div>
          <div className="flex flex-col gap-2">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="w-[100px] flex-none truncate text-[11.5px] font-bold text-[#cfd5de]">
                  {p.n} · {p.name}
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#161b23]">
                  <div
                    className="h-full rounded-full bg-[#5a6470]"
                    style={{ width: `${(p.count / maxPlayerCount) * 100}%` }}
                  />
                </div>
                <div className="w-5 flex-none text-right text-[12px] font-extrabold text-[#eef1f5]">{p.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DuelPitchMap duels={duelActions} />

      {duels.length > 0 && (
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[.4px] text-[#7f8794]">
            Duelos por jugador
          </div>
          <div className="flex flex-col gap-2">
            {duels.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="w-[100px] flex-none truncate text-[11.5px] font-bold text-[#cfd5de]">
                  {p.n} · {p.name}
                </div>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#161b23]">
                  {p.won > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${(p.won / p.total) * 100}%`, background: DUEL_RESULT_META.ganado.color }}
                    />
                  )}
                  {p.lost > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${(p.lost / p.total) * 100}%`, background: DUEL_RESULT_META.perdido.color }}
                    />
                  )}
                </div>
                <div className="w-11 flex-none text-right text-[11px] font-extrabold">
                  <span style={{ color: DUEL_RESULT_META.ganado.color }}>{p.won}</span>
                  <span className="text-[#4c545f]"> / </span>
                  <span style={{ color: DUEL_RESULT_META.perdido.color }}>{p.lost}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: DUEL_RESULT_META.ganado.color }} />
              <span className="text-[10px] font-semibold text-[#8b93a0]">Ganados</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: DUEL_RESULT_META.perdido.color }} />
              <span className="text-[10px] font-semibold text-[#8b93a0]">Perdidos</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
