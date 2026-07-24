import type { Tab } from '../types';

interface TabBarProps {
  tab: Tab;
  primary: string;
  onChange: (tab: Tab) => void;
}

export function TabBar({ tab, primary, onChange }: TabBarProps) {
  const tabClass = (active: boolean) =>
    `flex flex-1 cursor-pointer items-center justify-center text-[13px] font-bold border-t-2 ${
      active ? 'text-[#eef1f5]' : 'text-[#6b7280]'
    }`;

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex h-16 border-t border-[#1c222c] bg-[#0c0f14]">
      <div
        onClick={() => onChange('plantilla')}
        className={tabClass(tab === 'plantilla')}
        style={{ borderTopColor: tab === 'plantilla' ? primary : 'transparent' }}
      >
        Plantilla
      </div>
      <div
        onClick={() => onChange('partido')}
        className={tabClass(tab === 'partido')}
        style={{ borderTopColor: tab === 'partido' ? primary : 'transparent' }}
      >
        Partido
      </div>
    </div>
  );
}
