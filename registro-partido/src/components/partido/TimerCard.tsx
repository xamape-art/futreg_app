import { useState } from 'react';
import { getPhaseConfig, LIVE_CONFIG } from '../../constants';
import { formatClock, minuteStr } from '../../selectors';
import type { Phase } from '../../types';

interface TimerCardProps {
  phase: Phase;
  half: 1 | 2;
  running: boolean;
  seconds: number;
  primary: string;
  onAdvance: () => void;
  onReset: () => void;
  onSetTime: (seconds: number) => void;
}

function halfChipClass(active: boolean) {
  return active
    ? 'bg-[#FFD400] text-[#111] border border-[#FFD400]'
    : 'bg-transparent text-[#aeb6c2] border border-[#2b3038]';
}

export function TimerCard({ phase, half, running, seconds, primary, onAdvance, onReset, onSetTime }: TimerCardProps) {
  const pcfg = getPhaseConfig(primary)[phase];
  const [liveText, liveColor] = LIVE_CONFIG[phase];

  const [editing, setEditing] = useState(false);
  const [mm, setMm] = useState('0');
  const [ss, setSs] = useState('0');

  const openEditor = () => {
    setMm(String(Math.floor(seconds / 60)));
    setSs(String(seconds % 60));
    setEditing(true);
  };

  const confirmEdit = () => {
    const minutes = Math.max(0, Number(mm) || 0);
    const secs = Math.min(59, Math.max(0, Number(ss) || 0));
    onSetTime(minutes * 60 + secs);
    setEditing(false);
  };

  return (
    <div
      className="mx-[18px] mt-[6px] rounded-[22px] border border-[#232935] px-[18px] pb-4 pt-[18px]"
      style={{ background: 'linear-gradient(160deg,#181d26,#12161d)' }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className={`rounded-[9px] px-3 py-1 text-[12px] font-bold ${halfChipClass(half === 1)}`}>1ª</div>
          <div className={`rounded-[9px] px-3 py-1 text-[12px] font-bold ${halfChipClass(half === 2)}`}>2ª</div>
        </div>
        <div
          className={`text-[10px] font-extrabold tracking-[.5px] ${running ? 'animate-blink' : ''}`}
          style={{ color: liveColor }}
        >
          {liveText}
        </div>
      </div>

      {editing ? (
        <div className="flex items-center justify-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={mm}
            onChange={(e) => setMm(e.target.value)}
            className="w-[86px] rounded-[12px] border border-[#2b3038] bg-[#0f1218] text-center font-condensed text-[44px] font-extrabold tabular-nums text-white outline-none focus:border-[#FFD400]"
          />
          <span className="text-[44px] font-extrabold text-[#7f8794]">:</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            value={ss}
            onChange={(e) => setSs(e.target.value)}
            className="w-[86px] rounded-[12px] border border-[#2b3038] bg-[#0f1218] text-center font-condensed text-[44px] font-extrabold tabular-nums text-white outline-none focus:border-[#FFD400]"
          />
        </div>
      ) : (
        <div
          onClick={openEditor}
          className="cursor-pointer text-center font-condensed text-[66px] font-extrabold leading-[.95] tracking-[1px] tabular-nums"
        >
          {formatClock(seconds)}
        </div>
      )}

      {editing ? (
        <div className="mt-2 flex justify-center gap-2.5">
          <div
            onClick={confirmEdit}
            className="flex h-[38px] flex-1 max-w-[140px] cursor-pointer items-center justify-center rounded-[12px] bg-[#FFD400] text-[13px] font-extrabold text-[#111]"
          >
            GUARDAR
          </div>
          <div
            onClick={() => setEditing(false)}
            className="flex h-[38px] flex-1 max-w-[140px] cursor-pointer items-center justify-center rounded-[12px] border border-[#2b3038] text-[13px] font-bold text-[#aeb6c2]"
          >
            CANCELAR
          </div>
        </div>
      ) : (
        <div className="mt-0.5 text-center text-[13px] font-semibold text-[#7f8794]">
          minuto {minuteStr(seconds)}
        </div>
      )}

      <div className="mt-3.5 flex gap-2.5">
        <div
          onClick={onAdvance}
          className="flex h-[38px] flex-1 cursor-pointer items-center justify-center rounded-[12px] text-[13px] font-extrabold tracking-[.4px]"
          style={{ color: pcfg.fg, background: pcfg.bg }}
        >
          {pcfg.label}
        </div>
        <div
          onClick={onReset}
          className="flex h-[38px] w-[52px] flex-none cursor-pointer items-center justify-center rounded-[12px] border border-[#2b3038] text-[12px] font-bold text-[#aeb6c2] active:bg-[#1a1f28]"
        >
          RESET
        </div>
      </div>
    </div>
  );
}
