import { useEffect, useState } from 'react';
import { DEFAULT_LOCAL, DEFAULT_VISITANTE } from '../../constants';
import type { Action } from '../../state';
import type { MatchState } from '../../types';

interface CrearPartidoModalProps {
  state: MatchState;
  dispatch: React.Dispatch<Action>;
}

export function CrearPartidoModal({ state, dispatch }: CrearPartidoModalProps) {
  const [date, setDate] = useState(state.matchDate);
  const [local, setLocal] = useState(state.local);
  const [visitante, setVisitante] = useState(state.visitante);

  useEffect(() => {
    if (state.matchModalOpen) {
      setDate(state.matchDate);
      setLocal(state.local);
      setVisitante(state.visitante);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.matchModalOpen]);

  if (!state.matchModalOpen) return null;

  const canSave = date.trim() !== '' && local.trim() !== '' && visitante.trim() !== '';

  const handleSave = () => {
    if (!canSave) return;
    dispatch({
      type: 'SAVE_MATCH_INFO',
      date: date.trim(),
      local: local.trim() || DEFAULT_LOCAL,
      visitante: visitante.trim() || DEFAULT_VISITANTE,
    });
  };

  return (
    <div className="animate-slideup-modal absolute inset-0 z-40 flex flex-col bg-[#0c0f14]">
      <div className="flex items-center justify-between px-[18px] pb-3 pt-[50px]">
        <div className="font-condensed text-[19px] font-extrabold">Crear partido</div>
        <div
          onClick={() => dispatch({ type: 'CLOSE_MATCH_MODAL' })}
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] border border-[#2b3038] text-[17px] text-[#aeb6c2] active:bg-[#1a1f28]"
        >
          ✕
        </div>
      </div>

      <div className="flex flex-col gap-4 px-[18px] pt-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-[#7f8794]">Fecha</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full rounded-[11px] border border-[#262c37] bg-[#161b23] px-3 text-[14px] font-semibold text-[#eef1f5] outline-none focus:border-[#3a424f]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-[#7f8794]">Local</span>
          <input
            type="text"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="Equipo local"
            className="h-11 w-full rounded-[11px] border border-[#262c37] bg-[#161b23] px-3 text-[14px] font-semibold text-[#eef1f5] outline-none focus:border-[#3a424f]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-[#7f8794]">Visitante</span>
          <input
            type="text"
            value={visitante}
            onChange={(e) => setVisitante(e.target.value)}
            placeholder="Equipo visitante"
            className="h-11 w-full rounded-[11px] border border-[#262c37] bg-[#161b23] px-3 text-[14px] font-semibold text-[#eef1f5] outline-none focus:border-[#3a424f]"
          />
        </label>
      </div>

      <div className="mt-auto flex gap-2.5 px-[18px] pb-[26px] pt-2">
        <div
          onClick={() => dispatch({ type: 'CLOSE_MATCH_MODAL' })}
          className="flex h-[50px] w-[108px] flex-none cursor-pointer items-center justify-center rounded-[14px] border border-[#2b3038] font-bold text-[#aeb6c2] active:bg-[#1a1f28]"
        >
          Cancelar
        </div>
        <div
          onClick={handleSave}
          className="flex h-[50px] flex-1 items-center justify-center rounded-[14px] text-[15px] font-extrabold text-white"
          style={{
            background: canSave ? state.primary : '#39404b',
            opacity: canSave ? 1 : 0.7,
            cursor: canSave ? 'pointer' : 'not-allowed',
          }}
        >
          Guardar partido
        </div>
      </div>
    </div>
  );
}
