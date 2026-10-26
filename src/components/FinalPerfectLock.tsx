import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { NumericKeypad } from './NumericKeypad';
import { LEVEL_IMAGES } from '../levelAssets';

interface FinalPerfectLockProps {
  onSuccess: () => void;
}

const PASSWORD = '0628';

export function FinalPerfectLock({ onSuccess }: FinalPerfectLockProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (code === PASSWORD) {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('密碼錯誤');
      audioEngine.playBeep(220, 0.45);
      setCode('');
      setTimeout(() => setError(''), 2200);
    }
  };

  const handleKey = (key: string) => {
    audioEngine.playBeep(440, 0.08);
    setError('');
    if (key === '清除') setCode('');
    else if (key === '確定') submit();
    else if (code.length < 4) setCode((prev) => prev + key);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <LevelHeader title="完美的人" />

      <p className="text-stone-300 leading-relaxed text-base">
        順利開啟體育館大門後，空曠的場地上靜悄悄的，只有前方正中央的大螢幕亮著。螢幕上顯示：
      </p>

      <blockquote className="border-l-4 border-amber-600 pl-4 py-2 italic bg-amber-950/20 text-stone-100 rounded-r text-sm leading-relaxed">
        「完美數字是數學界中，全體正因數（除本身外）相加總和等於自身的神秘數字。」
      </blockquote>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-3">
          <ImagePlaceholder
            src={LEVEL_IMAGES.perfectScreen}
            alt="完美的人大螢幕"
            className="w-full max-w-lg mx-auto lg:mx-0"
          />
          <p className="text-xs text-stone-400 text-center leading-relaxed px-2">
            想見到真面目拿到畢業驚喜，請輸入由兩個完美數字組成的生日代碼。
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-stone-950 border-2 border-amber-900/40 w-full max-w-[320px] mx-auto lg:mx-0 shadow-2xl space-y-4">
          <div className="bg-black py-3.5 px-3 rounded-xl border border-rose-950 text-center text-3xl font-mono text-[#f43f5e] font-extrabold tracking-widest min-h-[55px] shadow-[inset_0_0_12px_rgba(239,68,68,0.3)]">
            {code || '----'}
          </div>
          <NumericKeypad onKey={handleKey} confirmLabel="驗證" />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center text-red-400 font-semibold p-3.5 bg-red-950/30 border border-red-500/20 rounded-xl text-xs">
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
