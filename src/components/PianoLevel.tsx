import { useState } from 'react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { ZhuyinKeyboard } from './ZhuyinKeyboard';
import { LEVEL_IMAGES } from '../levelAssets';

interface PianoLevelProps {
  onSuccess: () => void;
}

const VALID_ANSWERS = ['小星星', 'twinkle', '小星星歌'];
const PIANO_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;
const NOTE_LABELS = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];

export function PianoLevel({ onSuccess }: PianoLevelProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [activeKey, setActiveKey] = useState<number | null>(null);

  const playKey = (note: number) => {
    audioEngine.playPianoNote(note);
    setActiveKey(note);
    window.setTimeout(() => setActiveKey((prev) => (prev === note ? null : prev)), 180);
  };

  const submit = () => {
    const v = answer.trim();
    if (VALID_ANSWERS.includes(v) || v.toLowerCase() === 'twinkle') {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('密碼錯誤');
      audioEngine.playBeep(220, 0.4);
      setAnswer('');
      setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="神秘的旋律" />

      <p className="text-slate-300 leading-relaxed text-base">
        循著鏡中的線索來到 315 練琴室，裡面空無一人，只有一架靜靜佇立的鋼琴。走近一看，譜架上放著一張樂譜，上面有一串神秘的數字：「1 - 1 - 5 - 5 - 6 - 6 - 5」。
      </p>
      <blockquote className="border-l-2 border-amber-600/50 pl-4 py-2 bg-amber-950/10 rounded-r text-sm text-amber-200/90 italic">
        用最純粹的琴音喚醒那首我們都曾唱過的旋律吧！
      </blockquote>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-3">
          <ImagePlaceholder src={LEVEL_IMAGES.sheetMusic} alt="鋼琴樂譜" className="w-full max-w-md mx-auto lg:mx-0" />
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-2">
            <p className="text-xs text-slate-400 text-center">點擊琴鍵試彈</p>
            <div className="flex justify-center gap-1 px-1 touch-manipulation select-none">
              {PIANO_KEYS.map((note, i) => (
                <button
                  key={note}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    playKey(note);
                  }}
                  className={`relative flex flex-col items-center justify-end w-8 sm:w-10 h-24 sm:h-28 rounded-b-lg border-2 transition-all active:scale-95 ${
                    activeKey === note
                      ? 'bg-amber-100 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)] -translate-y-0.5'
                      : 'bg-gradient-to-b from-slate-100 to-slate-200 border-slate-400 hover:from-white hover:to-slate-100'
                  }`}
                  aria-label={`琴鍵 ${note} ${NOTE_LABELS[i]}`}
                >
                  <span className="text-base sm:text-lg font-black text-slate-800 pb-1.5">{note}</span>
                  <span className="text-[8px] text-slate-500 pb-1 font-mono">{NOTE_LABELS[i]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block text-center">數字代表的意義</span>
          <div className="w-full text-center font-sans text-xl py-3 border-2 border-slate-700 bg-slate-950 text-white rounded-xl min-h-[52px]">
            {answer || '　'}
          </div>
          <ZhuyinKeyboard
            enableLatin
            onCommit={(text) => {
              setError('');
              setAnswer((prev) => prev + text);
              audioEngine.playBeep(500, 0.04);
            }}
            onBackspace={() => setAnswer((prev) => prev.slice(0, -1))}
            onClear={() => setAnswer('')}
            onSubmit={submit}
            submitLabel="確認"
          />
          {error && <p className="text-center text-red-400 font-semibold text-xs">{error}</p>}
        </div>
      </div>
    </div>
  );
}
