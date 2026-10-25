import { useMemo, useState } from 'react';
import { endsWithTone, lookupZhuyin } from '../zhuyinDict';

interface ZhuyinKeyboardProps {
  onCommit: (text: string) => void;
  onBackspace: () => void;
  onClear?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  /** Allow ABC mode for English answers (e.g. twinkle). */
  enableLatin?: boolean;
}

const ZHUYIN_ROWS = [
  ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ'],
  ['ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ'],
  ['ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 'ㄧ', 'ㄨ', 'ㄩ'],
  ['ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ'],
  ['ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ', 'ˊ', 'ˇ', 'ˋ', '˙'],
];

const LATIN_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

/**
 * On-screen Zhuyin IME: tap symbols → pick candidates → commit Chinese text.
 * Tone-1: tap 空白選字 after the syllable (or pick from partial matches).
 */
export function ZhuyinKeyboard({
  onCommit,
  onBackspace,
  onClear,
  onSubmit,
  submitLabel = '送出',
  enableLatin = false,
}: ZhuyinKeyboardProps) {
  const [mode, setMode] = useState<'zhuyin' | 'latin'>('zhuyin');
  const [composition, setComposition] = useState('');
  const [latinBuf, setLatinBuf] = useState('');

  const candidates = useMemo(() => lookupZhuyin(composition), [composition]);

  const tapZhuyin = (sym: string) => {
    setComposition((prev) => {
      const next = prev + sym;
      return next.length > 24 ? prev : next;
    });
  };

  const pickCandidate = (text: string) => {
    onCommit(text);
    setComposition('');
  };

  const handleBackspace = () => {
    if (mode === 'latin') {
      if (latinBuf) {
        setLatinBuf((p) => p.slice(0, -1));
        return;
      }
      onBackspace();
      return;
    }
    if (composition) {
      setComposition((p) => p.slice(0, -1));
      return;
    }
    onBackspace();
  };

  const handleClear = () => {
    setComposition('');
    setLatinBuf('');
    onClear?.();
  };

  const commitLatin = () => {
    if (!latinBuf) return;
    onCommit(latinBuf);
    setLatinBuf('');
  };

  const keyBtn =
    'min-w-[1.85rem] h-9 px-1 rounded-md bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-100 text-sm font-bold active:scale-95 transition';
  const toneBtn =
    'min-w-[1.85rem] h-9 px-1 rounded-md bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 text-amber-200 text-sm font-bold active:scale-95 transition';

  return (
    <div className="space-y-2 select-none touch-manipulation">
      {enableLatin && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => { setMode('zhuyin'); setLatinBuf(''); }}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition ${
              mode === 'zhuyin' ? 'bg-amber-700 border-amber-600 text-white' : 'bg-stone-900 border-stone-700 text-stone-400'
            }`}
          >
            注音
          </button>
          <button
            type="button"
            onClick={() => { setMode('latin'); setComposition(''); }}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition ${
              mode === 'latin' ? 'bg-amber-700 border-amber-600 text-white' : 'bg-stone-900 border-stone-700 text-stone-400'
            }`}
          >
            ABC
          </button>
        </div>
      )}

      {mode === 'zhuyin' ? (
        <>
          <div className="rounded-lg border border-stone-800 bg-black/60 px-3 py-2 min-h-[40px] flex items-center gap-2">
            <span className="font-mono text-amber-300 tracking-widest text-sm break-all flex-1">
              {composition || <span className="text-stone-600 tracking-normal">注音組字中…</span>}
            </span>
            {composition && !endsWithTone(composition) && (
              <span className="shrink-0 text-[10px] text-stone-500">一聲可不標調</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-lg border border-stone-800 bg-stone-950">
            {candidates.length === 0 ? (
              <span className="text-[11px] text-stone-600 w-full text-center py-1">
                {composition ? '尚無候選，請繼續輸入或改標調' : '點注音 → 選字'}
              </span>
            ) : (
              candidates.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => pickCandidate(ch)}
                  className="min-w-[2.4rem] h-10 px-2 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-100 text-lg font-bold active:scale-95 transition"
                >
                  {ch}
                </button>
              ))
            )}
          </div>

          <div className="space-y-1">
            {ZHUYIN_ROWS.map((row, ri) => (
              <div key={ri} className="flex flex-wrap justify-center gap-1">
                {row.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => tapZhuyin(sym)}
                    className={/[ˊˇˋ˙]/.test(sym) ? toneBtn : keyBtn}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-lg border border-stone-800 bg-black/60 px-3 py-2 min-h-[40px] text-center font-mono text-sky-300 tracking-[0.2em]">
            {latinBuf || <span className="text-stone-600 tracking-normal">ABC</span>}
          </div>
          <div className="space-y-1">
            {LATIN_ROWS.map((row) => (
              <div key={row[0]} className="flex justify-center gap-1">
                {row.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setLatinBuf((p) => p + ch.toLowerCase())}
                    className={keyBtn}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={commitLatin}
            disabled={!latinBuf}
            className="w-full h-9 rounded-md bg-sky-900/50 border border-sky-800 text-sky-200 text-xs font-bold disabled:opacity-40"
          >
            插入英文字
          </button>
        </>
      )}

      <div className="flex justify-center gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={handleBackspace}
          className="h-9 px-3 rounded-md bg-stone-900 border border-stone-700 text-stone-300 text-xs font-bold active:scale-95"
        >
          ⌫
        </button>
        {onClear && (
          <button
            type="button"
            onClick={handleClear}
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
