interface NumericKeypadProps {
  onKey: (key: string) => void;
  confirmLabel?: string;
  disabled?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0', '確定'] as const;

/** Shared on-screen numeric keypad for lock-style levels. */
export function NumericKeypad({
  onKey,
  confirmLabel = '確定',
  disabled = false,
}: NumericKeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
      {KEYS.map((key) => {
        const label = key === '確定' ? confirmLabel : key;
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onKey(key)}
            className={`h-11 rounded-lg flex items-center justify-center font-bold tracking-wide transition active:scale-95 disabled:opacity-40 ${
              key === '確定'
                ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-sm shadow-lg shadow-amber-500/20'
                : key === '清除'
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs'
                  : 'bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-base'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
