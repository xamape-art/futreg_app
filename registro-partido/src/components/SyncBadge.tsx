import type { SyncStatus } from '../types';

interface SyncBadgeProps {
  status: SyncStatus;
  error: string | null;
}

const LABEL: Record<SyncStatus, string | null> = {
  off: null, // sin credenciales: no hay nada que contar al usuario
  'signed-out': 'Solo local',
  hydrating: 'Cargando',
  idle: 'Guardado',
  saving: 'Guardando',
  error: 'Sin guardar',
};

const COLOR: Record<SyncStatus, string> = {
  off: '#6b7280',
  'signed-out': '#6b7280',
  hydrating: '#7f8794',
  idle: '#3ddc84',
  saving: '#FFD400',
  error: '#ff6b6b',
};

export function SyncBadge({ status, error }: SyncBadgeProps) {
  const label = LABEL[status];
  if (!label) return null;

  return (
    <div
      className="pointer-events-none absolute right-[18px] top-[22px] z-20 flex items-center gap-1.5"
      title={error ?? undefined}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLOR[status] }} />
      <span className="text-[10px] font-bold uppercase tracking-[.4px] text-[#6b7280]">{label}</span>
    </div>
  );
}
