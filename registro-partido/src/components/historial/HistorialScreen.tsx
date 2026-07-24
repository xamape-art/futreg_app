import { ACTION_META, ACTION_TYPES } from '../../constants';
import { formatMatchDate, minuteStr } from '../../selectors';
import type { Cloud } from '../../hooks/useCloud';

interface HistorialScreenProps {
  cloud: Cloud;
  currentMatchId: string | null;
}

export function HistorialScreen({ cloud, currentMatchId }: HistorialScreenProps) {
  const { session, history, status } = cloud;

  return (
    <div className="absolute inset-x-0 top-0 bottom-16 flex flex-col bg-[#10131a]">
      <div className="flex items-start justify-between px-[22px] pb-3 pt-[52px]">
        <div className="min-w-0">
          <div className="font-condensed text-[24px] font-extrabold">Historial</div>
          <div className="mt-0.5 truncate text-[12px] font-medium text-[#7f8794]">
            {session ? session.user.email : 'Sin cuenta · no se guarda nada en la nube'}
          </div>
        </div>
        {session && (
          <button
            type="button"
            onClick={() => void cloud.signOut()}
            className="flex-none rounded-[20px] border border-[#2b3038] px-3 py-2 text-[12px] font-bold text-[#aeb6c2] active:bg-[#1a1f28]"
          >
            Salir
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-[18px] pb-5 pt-1">
        {!cloud.enabled && (
          <p className="px-1 py-6 text-[13px] font-medium leading-relaxed text-[#7f8794]">
            La app no tiene credenciales de Supabase configuradas, asi que funciona solo en este dispositivo.
          </p>
        )}

        {cloud.enabled && !session && (
          <p className="px-1 py-6 text-[13px] font-medium leading-relaxed text-[#7f8794]">
            Entra con tu email para guardar los partidos y consultarlos desde otro dispositivo.
          </p>
        )}

        {session && status === 'hydrating' && (
          <p className="px-1 py-6 text-[13px] font-medium text-[#7f8794]">Cargando partidos...</p>
        )}

        {session && status !== 'hydrating' && history.length === 0 && (
          <p className="px-1 py-6 text-[13px] font-medium leading-relaxed text-[#7f8794]">
            Todavia no hay partidos guardados. El que registres ahora aparecera aqui.
          </p>
        )}

        {history.map((m) => {
          const isCurrent = m.id === currentMatchId;
          return (
            <div
              key={m.id}
              className="mb-2 rounded-[14px] border border-[#202632] bg-[#141922] p-3"
              style={isCurrent ? { borderColor: '#FFD400' } : undefined}
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0 truncate text-[15px] font-bold">
                  {m.local} <span className="text-[#6b7280]">vs</span> {m.visitante}
                </div>
                <div className="flex-none text-[11px] font-semibold text-[#7f8794]">
                  {formatMatchDate(m.date)}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3">
                {ACTION_TYPES.map((k) => (
                  <div key={k} className="flex items-baseline gap-1">
                    <span
                      className="font-condensed text-[17px] font-extrabold leading-none"
                      style={{ color: ACTION_META[k].color }}
                    >
                      {m.counts[k]}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[.4px] text-[#6b7280]">
                      {ACTION_META[k].short}
                    </span>
                  </div>
                ))}
                <div className="ml-auto text-[11px] font-semibold text-[#6b7280]">
                  {minuteStr(m.seconds)}
                  {!m.finished && ' · en curso'}
                </div>
              </div>

              <div className="mt-2.5 flex gap-2">
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => void cloud.openMatch(m.id)}
                  className="flex-1 rounded-[10px] border border-[#2b3038] py-2 text-[12px] font-bold text-[#aeb6c2] active:bg-[#1a1f28] disabled:opacity-40"
                >
                  {isCurrent ? 'Abierto' : 'Abrir'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Borrar ${m.local} vs ${m.visitante}? No se puede deshacer.`)) {
                      void cloud.removeMatch(m.id);
                    }
                  }}
                  className="flex-none rounded-[10px] border border-[#2b3038] px-3 py-2 text-[12px] font-bold text-[#8b6b6b] active:bg-[#1a1f28]"
                >
                  Borrar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
