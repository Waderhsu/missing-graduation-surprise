import { useState } from 'react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { CombinationLock } from './CombinationLock';
import { LEVEL_IMAGES } from '../levelAssets';

interface MagicSquareLevelProps {
  onSuccess: () => void;
}

const PASSWORD = '137';

export function MagicSquareLevel({ onSuccess }: MagicSquareLevelProps) {
  const [error, setError] = useState('');

  const handleSubmit = (code: string) => {
    if (code === PASSWORD) {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('密碼錯誤');
      audioEngine.playBeep(220, 0.4);
      setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="絕對平衡的置物櫃" />

      <p className="text-stone-300 leading-relaxed text-base">
        推開沉重的宿舍大門，熟悉的交誼廳映入眼簾，大家在這裡挑燈夜戰、互相打氣的畫面彷彿是昨天發生的事情。這時你看到在正中央的桌上，放著一個有「三位數密碼鎖」的盒子，旁邊有一張宿舍置物櫃的九宮格配置圖.......
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ImagePlaceholder
          src={LEVEL_IMAGES.magicSquare}
          alt="九宮格置物櫃配置圖"
          className="max-w-sm mx-auto lg:mx-0 w-full"
        />

        <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl space-y-3">
          <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block text-center">
            🔒 三位數密碼鎖
          </span>
          <CombinationLock length={3} onSubmit={handleSubmit} submitLabel="送出密碼打開盒子" />
          {error && <p className="text-center text-red-400 text-xs font-semibold">{error}</p>}
        </div>
      </div>
    </div>
  );
}
