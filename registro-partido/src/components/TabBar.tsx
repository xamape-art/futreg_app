import type { Tab } from '../types';

interface TabBarProps {
  tab: Tab;
  primary: string;
  onChange: (tab: Tab) => void;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'plantilla', label: 'Plantilla' },
  { key: 'partido', label: 'Partido' },
  { key: 'historial', label: 'Historial' },
];

export function TabBar({ tab, primary, onChange }: TabBarProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex h-16 border-t border-[#1c222c] bg-[#0c0f14]">
      {TABS.map(({ key, label }) => (
        <div
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-1 cursor-pointer items-center justify-center border-t-2 text-[13px] font-bold ${
            tab === key ? 'text-[#eef1f5]' : 'text-[#6b7280]'
          }`}
          style={{ borderTopColor: tab === key ? primary : 'transparent' }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
