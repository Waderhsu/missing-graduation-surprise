import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { CombinationLock } from './CombinationLock';
import { LEVEL_IMAGES } from '../levelAssets';

interface GymOuterLockProps {
  onSuccess: () => void;
}

const PASSWORD = '3100';

export function GymOuterLock({ onSuccess }: GymOuterLockProps) {
  const [error, setError] = useState('');

  const handleSubmit = (code: string) => {
    if (code === PASSWORD) {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('❌ 體育館大門的密碼鎖拒絕開啟，請重新解讀三道謎題。');
      audioEngine.playBeep(220, 0.4);
      setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="數字的重組" />

      <p className="text-stone-300 leading-relaxed text-base">
        你氣喘吁吁地來到體育館大門，卻發現門是緊鎖的。嫌犯果然不會讓我們這麼輕易破關！這時，你看到實體鎖頭旁邊貼著一張精緻的密碼提示卡，上面寫著三道奇怪的數學謎題：
      </p>

      <blockquote className="border-l-2 border-amber-600/50 pl-4 py-2 bg-amber-950/10 rounded-r text-sm text-amber-200/90 italic">
        「把文字當成積木，轉個彎、疊在一起、排排站，答案就在形狀裡。」
      </blockquote>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ImagePlaceholder
          src={LEVEL_IMAGES.gymOuterLock}
          alt="體育館大門密碼提示卡"
          className="w-full max-w-md mx-auto lg:mx-0"
        />

        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-3">
          <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block text-center">
            🔐 密碼鎖
          </span>
          <CombinationLock length={4} onSubmit={handleSubmit} submitLabel="開啟體育館大門" />
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center font-semibold">
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
