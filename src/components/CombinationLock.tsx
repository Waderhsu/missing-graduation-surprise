import { useMemo, useState } from 'react';
import { audioEngine } from './AudioEngine';

interface CombinationLockProps {
  length: number;
  onSubmit: (code: string) => void;
  submitLabel?: string;
}

/** Scrollable digit-wheel combination lock. */
export function CombinationLock({
  length,
  onSubmit,
  submitLabel = '解鎖',
}: CombinationLockProps) {
  const [digits, setDigits] = useState<number[]>(() => Array.from({ length }, () => 0));
  const digitsList = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);

  const nudge = (index: number, delta: number) => {
    audioEngine.playBeep(380 + index * 20, 0.05);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = (next[index] + delta + 10) % 10;
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2 sm:gap-3 py-3 px-3 rounded-2xl bg-gradient-to-b from-stone-800 to-stone-950 border border-stone-700 shadow-inner">
        {digits.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => nudge(i, 1)}
              className="w-10 h-7 rounded-md bg-stone-900 border border-stone-700 text-stone-400 text-xs font-bold hover:bg-stone-800 active:scale-95"
              aria-label={`Digit ${i + 1} up`}
            >
              ▲
            </button>
            <div className="relative w-11 h-14 rounded-lg bg-black border-2 border-amber-700/50 flex items-center justify-center shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
              <span className="font-mono text-3xl font-black text-amber-400 tabular-nums">{d}</span>
              <div className="absolute inset-0 flex flex-col justify-between py-0.5 opacity-20 pointer-events-none">
                {digitsList.filter((_, idx) => Math.abs(idx - d) <= 1 && idx !== d).map((n) => (
                  <span key={n} className="text-center text-[10px] font-mono text-stone-500">{n}</span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => nudge(i, -1)}
              className="w-10 h-7 rounded-md bg-stone-900 border border-stone-700 text-stone-400 text-xs font-bold hover:bg-stone-800 active:scale-95"
              aria-label={`Digit ${i + 1} down`}
            >
              ▼
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onSubmit(digits.join(''))}
        className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition active:scale-[0.98]"
      >
        {submitLabel}
      </button>
    </div>
  );
}
