interface CharKeyboardProps {
  chars: string[];
  onKey: (ch: string) => void;
  onBackspace: () => void;
  onClear?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
}

/** On-screen character pad for Chinese / short answers. */
export function CharKeyboard({
  chars,
  onKey,
  onBackspace,
  onClear,
  onSubmit,
  submitLabel = '送出',
}: CharKeyboardProps) {
  return (
    <div className="space-y-2 select-none touch-manipulation">
      <div className="flex flex-wrap justify-center gap-1.5">
        {chars.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => onKey(ch)}
            className="min-w-[2.25rem] h-10 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-100 text-base font-bold active:scale-95 transition"
          >
            {ch}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-1.5">
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
