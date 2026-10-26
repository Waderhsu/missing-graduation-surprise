import { useState } from 'react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { NumericKeypad } from './NumericKeypad';
import { LEVEL_IMAGES } from '../levelAssets';

interface MirrorWallLevelProps {
  onSuccess: () => void;
}

const PASSWORD = '315';

export function MirrorWallLevel({ onSuccess }: MirrorWallLevelProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (password === PASSWORD) {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.35);
      onSuccess();
    } else {
      setError('密碼錯誤');
      audioEngine.playBeep(220, 0.4);
      setPassword('');
      setTimeout(() => setError(''), 2200);
    }
  };

  const handleKey = (key: string) => {
    audioEngine.playBeep(440, 0.08);
    setError('');
    if (key === '清除') setPassword('');
    else if (key === '確定') submit();
    else if (password.length < 3) setPassword((prev) => prev + key);
  };

  return (
    <div className="space-y-6">
      <LevelHeader title="倒影中的真相" />

      <p className="text-stone-300 leading-relaxed text-base">
        氣喘吁吁地跑到藝文館一樓，果然在熟悉的整面大鏡牆前，找到了另外半張殘破的《星夜》明信片。
        站在這面巨大的鏡子前，你不禁想起了八年級為了宿營晚會，全班在這裡揮汗練舞的時光。
        那時候，面對這面鏡子，總能一眼看出誰的動作沒有左右對稱、誰的走位錯了。
        鏡子，總是能最誠實地映照出我們的真實。
      </p>

      <p className="text-stone-300 leading-relaxed text-base">
        你將兩半的明信片拼在一起後翻到背面，發現上面用濃厚且微微未乾的水彩顏料，寫了三排混雜著英文與數字的字串！
      </p>

      <blockquote className="border-l-2 border-amber-600/50 pl-4 py-2 bg-amber-950/10 rounded-r text-sm text-amber-200/90 italic">
        「凡人的偽裝在鏡子前總會破功。不要相信你雙眼直視的表象，轉過身，讓鏡子告訴你真正的答案。看懂了，就到這個地方來找我拿下一道線索吧！」
      </blockquote>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ImagePlaceholder src={LEVEL_IMAGES.mirrorPostcard} alt="星夜明信片背面" />

        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl shadow-xl space-y-4">
          <label className="text-sm font-bold text-stone-200 block text-center">
            到
            <span className="inline-block min-w-[3.5rem] mx-1 border-b border-dashed border-amber-500/60 text-amber-400 font-mono tracking-[0.2em] text-center align-bottom">
              {password || '___'}
            </span>
            教室
          </label>
          <NumericKeypad onKey={handleKey} confirmLabel="前往" />
          {error && <p className="text-red-400 text-xs text-center font-semibold">{error}</p>}
        </div>
      </div>
    </div>
  );
}
