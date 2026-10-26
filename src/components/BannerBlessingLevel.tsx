import { useState } from 'react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { ZhuyinKeyboard } from './ZhuyinKeyboard';
import { LEVEL_IMAGES } from '../levelAssets';

interface BannerBlessingLevelProps {
  onSuccess: () => void;
}

const VALID = ['祝你畢業快樂', '祝妳畢業快樂'];

export function BannerBlessingLevel({ onSuccess }: BannerBlessingLevelProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const v = answer.trim();
    if (VALID.includes(v)) {
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
      <LevelHeader title="錯置的祝福" />

      <div className="text-stone-300 leading-relaxed text-base space-y-3">
        <p>
          循著日記的注音線索，你來到了探索中心。一推開門，桌子正中央平鋪著那面最熟悉的紫底「康橋菁英活動布旗」。
        </p>
        <p>
          你走上前，手指輕輕滑過布章，回憶湧上心頭。台北動物園的初次探險、觀音山峻峭的訓練、合歡東峰雲霧繚繞的登頂、隔宿露營的營火餘燼、泳渡日月潭的波光，一直到新加坡國際交流.........這三年，我們的體能與膽識都在這些挑戰中不斷蛻變。
        </p>
        <p>
          你發現布旗旁邊有一張嫌犯留下的信，內容錯字連篇……仔細閱讀好像是嫌犯留下的線索。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <ImagePlaceholder src={LEVEL_IMAGES.banner} alt="康橋菁英活動布旗" className="w-full max-w-md mx-auto lg:mx-0" />

        <div className="space-y-4 bg-stone-900 border border-stone-800 p-5 rounded-2xl">
          <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block text-center">請輸入在日記中找到的線索</span>
          <div className="w-full text-center text-xl py-3 border border-stone-800 bg-stone-950 text-white rounded-xl min-h-[52px]">
            {answer || '　'}
          </div>
          <ZhuyinKeyboard
            onCommit={(text) => {
              setError('');
              setAnswer((prev) => prev + text);
              audioEngine.playBeep(500, 0.04);
            }}
            onBackspace={() => setAnswer((prev) => prev.slice(0, -1))}
            onClear={() => setAnswer('')}
            onSubmit={submit}
            submitLabel="送出答案"
          />
          {error && <p className="text-red-400 text-xs text-center font-semibold">{error}</p>}
        </div>
      </div>
    </div>
  );
}
