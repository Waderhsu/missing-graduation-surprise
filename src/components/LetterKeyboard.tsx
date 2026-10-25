interface LetterKeyboardProps {
  onKey: (ch: string) => void;
  onBackspace: () => void;
  onClear?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

/** On-screen A–Z keyboard for letter codes (e.g. MATH). */
export function LetterKeyboard({
  onKey,
  onBackspace,
  onClear,
  onSubmit,
  submitLabel = '送出',
}: LetterKeyboardProps) {
  return (
    <div className="space-y-1.5 select-none touch-manipulation">
      {ROWS.map((row) => (
        <div key={row[0]} className="flex justify-center gap-1">
          {row.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => onKey(ch)}
              className="min-w-[1.7rem] h-9 px-1.5 rounded-md bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-100 text-sm font-bold active:scale-95 transition"
            >
              {ch}
            </button>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-1.5 pt-1">
        <button
          type="button"
          onClick={onBackspace}
          className="h-9 px-3 rounded-md bg-stone-900 border border-stone-700 text-stone-300 text-xs font-bold active:scale-95"
        >
          ⌫
        </button>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="h-9 px-3 rounded-md bg-stone-900 border border-stone-700 text-stone-300 text-xs font-bold active:scale-95"
          >
            清除
          </button>
        )}
        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            className="h-9 px-4 rounded-md bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold active:scale-95"
          >
            {submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}
