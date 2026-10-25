import { useState } from 'react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface LawnDiaryLevelProps {
  onSuccess: () => void;
}

export function LawnDiaryLevel({ onSuccess }: LawnDiaryLevelProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = answer.trim();
    if (v === '探索中心') {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('❌ 地點不正確！請仔細閱讀日記中的注音線索。');
      audioEngine.playBeep(220, 0.4);
      setAnswer('');
      setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="ㄖˋ ㄐㄧˋ" />

      <p className="text-stone-300 leading-relaxed text-base">
        你來到小學樓前那片熟悉的草皮，想起過去無憂無慮、吃飽飯後與同學遊戲的時光。看著眼前的景象，你忍不住在心裡感嘆：「小學的時候，這裡就是我們的遊樂場，每天吃飽最喜歡和同學在這裡跑跳。唉，國中的課業壓力真是沉重啊……還好有這片草皮，這是我現在唯一能讓心靈喘口氣、找回一點童心的地方了。」
        在草皮的一角，你發現了一本被遺忘的日記.........
      </p>

      <ImagePlaceholder src={LEVEL_IMAGES.lawnDiary} alt="小學樓草皮日記" className="max-w-3xl mx-auto" />

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 bg-stone-900 border border-stone-800 p-5 rounded-2xl">
        <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block text-center">🔐 日記指向何處？</span>
        <input
          type="text"
          value={answer}
          onChange={(e) => { setError(''); setAnswer(e.target.value); }}
          placeholder="請輸入地點名稱..."
          className="w-full text-center text-lg py-3 border border-stone-800 bg-stone-950 text-white rounded-xl focus:border-emerald-500 outline-none"
        />
        <button type="submit" className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition">
          前往該地點
        </button>
        {error && <p className="text-red-400 text-xs text-center font-semibold">{error}</p>}
      </form>
    </div>
  );
}
