import type { Action } from '../../state';
import type { MatchState } from '../../types';

interface PlantillaScreenProps {
  state: MatchState;
  dispatch: React.Dispatch<Action>;
  /** Sube a Storage si hay sesion; si no, guarda la foto como data URL. */
  onPhoto: (id: number, file: File) => Promise<void>;
}

export function PlantillaScreen({ state, dispatch, onPhoto }: PlantillaScreenProps) {
  const handlePhoto = (id: number, file: File | undefined) => {
    if (!file) return;
    void onPhoto(id, file);
  };

  return (
    <div className="absolute inset-x-0 top-0 bottom-16 flex flex-col bg-[#10131a]">
      <div className="px-[22px] pb-3 pt-[52px]">
        <div className="font-condensed text-[24px] font-extrabold">Plantilla</div>
        <div className="mt-0.5 text-[12px] font-medium text-[#7f8794]">
          11 titulares · toca la foto para cambiarla
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-[18px] pb-5 pt-1">
        {state.roster.map((p) => (
          <div key={p.id} className="flex items-center gap-[13px] border-b border-[#191e27] py-[9px]">
            <label
              className="relative h-[52px] w-[52px] flex-none cursor-pointer rounded-full bg-cover bg-center"
              style={{
                backgroundColor: p.photo ? '#000' : state.primary,
                backgroundImage: p.photo ? `url(${p.photo})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '2px solid rgba(255,255,255,.25)',
              }}
            >
              {!p.photo && (
                <span className="flex h-full w-full items-center justify-center font-condensed text-[19px] font-extrabold text-white">
                  {p.n}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 border-[#10131a] bg-[#FFD400] text-[14px] font-extrabold text-[#111]">
                +
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhoto(p.id, e.target.files?.[0])}
              />
            </label>
            <div className="w-[52px] flex-none">
              <div className="mb-[3px] text-[9px] font-bold uppercase text-[#6b7280]">Dorsal</div>
              <input
                value={p.n}
                onChange={(e) => dispatch({ type: 'SET_ROSTER_FIELD', id: p.id, field: 'n', value: e.target.value })}
                inputMode="numeric"
                className="h-[38px] w-[52px] rounded-[10px] border border-[#262c37] bg-[#161b23] text-center font-condensed text-[17px] font-extrabold text-[#eef1f5] outline-none"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-[3px] text-[9px] font-bold uppercase text-[#6b7280]">Nombre</div>
              <input
                value={p.name}
                onChange={(e) => dispatch({ type: 'SET_ROSTER_FIELD', id: p.id, field: 'name', value: e.target.value })}
                className="h-[38px] w-full rounded-[10px] border border-[#262c37] bg-[#161b23] px-3 text-[15px] font-semibold text-[#eef1f5] outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
