import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Compass, MapPin, RotateCcw, RotateCw, TriangleAlert } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { ZhuyinKeyboard } from './ZhuyinKeyboard';
import { LevelHeader } from './LevelHeader';
import { LEVEL_IMAGES } from '../levelAssets';

interface MapOverlayProps {
  onSuccess: () => void;
}

const STAR_MAP = LEVEL_IMAGES.starMap;
const HINT_MAP = LEVEL_IMAGES.hintMap;

/** Target rotation angle for star alignment. */
const TARGET_ANGLE = 64;
const TOLERANCE = 4;
const INITIAL_ANGLE = 185;

/** Hint map A/B/C/D marker positions (percent). */
const HINT_MARKERS: { label: string; x: number; y: number }[] = [
  { label: 'A', x: 74, y: 23 },
  { label: 'B', x: 47, y: 33 },
  { label: 'C', x: 36, y: 61 },
  { label: 'D', x: 49.5, y: 58 },
];

/** Fixed tablet star positions (percent): 2 top, 4 bottom. */
const TABLET_STARS: [number, number][] = [
  [63, 47], [75, 63],
  [31.5, 40], [44, 57], [55.5, 73], [68, 89],
];

function normalizeAngle(deg: number) {
  return ((deg % 360) + 360) % 360;
}

function angularDistance(a: number, b: number) {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
}

function pointerAngle(clientX: number, clientY: number, rect: DOMRect) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return normalizeAngle(Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI));
}

export function MapOverlay({ onSuccess }: MapOverlayProps) {
  const [angle, setAngle] = useState(INITIAL_ANGLE);
  const [aligned, setAligned] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loc1, setLoc1] = useState('');
  const [loc2, setLoc2] = useState('');
  const [loc3, setLoc3] = useState('');
  const [loc4, setLoc4] = useState('');
  const [activeField, setActiveField] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [error, setError] = useState('');

  const rotateRef = useRef<HTMLDivElement>(null);

  const fieldValue = activeField === 'A' ? loc1 : activeField === 'B' ? loc2 : activeField === 'C' ? loc3 : loc4;
  const setFieldValue = (v: string) => {
    if (activeField === 'A') setLoc1(v);
    else if (activeField === 'B') setLoc2(v);
    else if (activeField === 'C') setLoc3(v);
    else setLoc4(v);
  };
  const dragRef = useRef<{ lastPointerAngle: number } | null>(null);

  const applyRotationDelta = useCallback((delta: number) => {
    setAngle((prev) => {
      const next = normalizeAngle(prev + delta);
      const prevRounded = Math.round(prev);
      const nextRounded = Math.round(next);
      if (nextRounded % 15 === 0 && prevRounded !== nextRounded) {
        audioEngine.playBeep(300 + nextRounded / 2, 0.02, 'sine');
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (aligned || isDragging) return;
    if (angularDistance(angle, TARGET_ANGLE) <= TOLERANCE) {
      setAligned(true);
      setAngle(TARGET_ANGLE);
      audioEngine.playBeep(880, 0.1);
      audioEngine.playBeep(1100, 0.15);
      audioEngine.playBeep(1400, 0.3);
    }
  }, [angle, aligned, isDragging]);

  useEffect(() => {
    if (!isDragging || aligned) return;

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current || !rotateRef.current) return;
      e.preventDefault();
      const rect = rotateRef.current.getBoundingClientRect();
      const currentPointer = pointerAngle(e.clientX, e.clientY, rect);
      let delta = currentPointer - dragRef.current.lastPointerAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      setAngle((prev) => {
        const next = normalizeAngle(prev + delta);
        const prevRounded = Math.round(prev);
        const nextRounded = Math.round(next);
        if (nextRounded % 15 === 0 && prevRounded !== nextRounded) {
          audioEngine.playBeep(300 + nextRounded / 2, 0.02, 'sine');
        }
        return next;
      });
      dragRef.current.lastPointerAngle = currentPointer;
    };

    const onEnd = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onEnd);
    document.addEventListener('pointercancel', onEnd);

    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onEnd);
      document.removeEventListener('pointercancel', onEnd);
    };
  }, [isDragging, aligned]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (aligned) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = { lastPointerAngle: pointerAngle(e.clientX, e.clientY, rect) };
    setIsDragging(true);
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = loc1.trim();
    const b = loc2.trim();
    const c = loc3.trim();
    const d = loc4.trim();
    const ok1 = a === '宿舍';
    const ok2 = b === '體育館';
    const ok3 = c === '小學樓';
    const ok4 = d === '藝文館';
    if (ok1 && ok2 && ok3 && ok4) {
      audioEngine.playSuccessGain();
      onSuccess();
    } else {
      audioEngine.playBeep(220, 0.45, 'triangle');
      setError(`❌ 有地標名稱填寫錯誤！`);
      setTimeout(() => setError(''), 3500);
    }
  };

  return (
    <div className="space-y-5">
      <LevelHeader title="疊合的真相" />

      <p className="text-stone-300 text-sm leading-relaxed">
        你盯著平板上的六顆星，再低頭看看手邊的實體校園地圖，突然發現：地圖上竟然也印著兩顆星星標記！一顆在剛才潛入的「警衛室」，另一顆就在現在所處的「中學樓」（九導辦公室）。
      </p>
      <blockquote className="border-l-2 border-amber-600/50 pl-4 py-2 bg-amber-950/10 rounded-r text-sm text-amber-200/90 italic">
        如果這兩顆星代表已經破解的地方，那麼平板上剩下的四顆星，一定就是嫌犯藏匿線索的地點！
      </blockquote>

      {!aligned && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs text-stone-400 text-center">
            🎯 在圓形區域拖曳旋轉紙地圖，或使用下方按鈕微調
          </span>
          <div
            ref={rotateRef}
            onPointerDown={handlePointerDown}
            className="relative w-full max-w-[min(480px,85vw)] aspect-square rounded-full border-4 border-stone-800 overflow-hidden shadow-2xl touch-none select-none bg-[#070b10] cursor-grab active:cursor-grabbing"
            style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
          >
            <div className="absolute inset-0">
              <div className="absolute inset-0 pointer-events-none z-10">
                {TABLET_STARS.map(([x, y], i) => (
                  <span
                    key={`bg-${i}`}
                    className="absolute text-xl -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <motion.div
                animate={{ rotate: angle }}
                transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 24, stiffness: 200 }}
                className="absolute inset-0 origin-center scale-120 pointer-events-none"
              >
                <img
                  src={STAR_MAP}
                  alt="校園紙地圖"
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-contain opacity-[0.48] pointer-events-none"
                />
              </motion.div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => applyRotationDelta(-5)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 text-xs font-bold hover:bg-stone-800 active:scale-95 transition touch-manipulation">
              <RotateCcw className="h-4 w-4" /> -5°
            </button>
            <p className="text-[11px] text-stone-500 font-mono min-w-[5rem] text-center">{Math.round(angle)}°</p>
            <button type="button" onClick={() => applyRotationDelta(5)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 text-xs font-bold hover:bg-stone-800 active:scale-95 transition touch-manipulation">
              +5° <RotateCw className="h-4 w-4" />
            </button>
          </div>
          <div className="w-full max-w-xl py-8 text-center text-stone-500 text-xs border border-dashed border-stone-800 rounded-xl">
            <Compass className="h-6 w-6 mx-auto text-stone-600 mb-2" />
            <TriangleAlert className="h-4 w-4 inline text-amber-500 mr-1" />
            請先旋轉紙地圖，讓星標與平板重合
          </div>
        </div>
      )}

      {aligned && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative w-full"
          >
            <p className="text-xs text-emerald-400 text-center mb-2">🟢 星標已重合 — 提示圖已解鎖</p>
            <img
              src={HINT_MAP}
              alt="星芒提示地圖"
              draggable={false}
              className="w-full rounded-xl border border-stone-800 shadow-2xl"
            />
            <div className="absolute inset-0 pointer-events-none top-6">
              {HINT_MARKERS.map(({ label, x, y }) => (
                <span
                  key={label}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-normal text-stone-950 border border-white"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 w-full">
            <h4 className="text-sm font-bold text-stone-200 flex items-center gap-1.5 border-b border-stone-800 pb-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              解鎖秘密地點
            </h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs text-stone-400">依提示圖 A、B、C、D 點選欄位後用注音鍵盤輸入：</p>
              {([
                { label: 'A' as const, value: loc1 },
                { label: 'B' as const, value: loc2 },
                { label: 'C' as const, value: loc3 },
                { label: 'D' as const, value: loc4 },
              ]).map((field) => (
                <button
                  key={field.label}
                  type="button"
                  onClick={() => setActiveField(field.label)}
                  className={`w-full text-left rounded-lg border px-3 py-2.5 transition ${
                    activeField === field.label
                      ? 'border-amber-500 bg-amber-950/20'
                      : 'border-stone-800 bg-stone-900'
                  }`}
                >
                  <span className="text-[11px] font-mono text-amber-500 mr-2">{field.label}</span>
                  <span className="text-sm text-stone-200">{field.value || '（點此輸入）'}</span>
                </button>
              ))}
              <ZhuyinKeyboard
                onCommit={(text) => {
                  setError('');
                  setFieldValue(fieldValue + text);
                  audioEngine.playBeep(500, 0.04);
                }}
                onBackspace={() => setFieldValue(fieldValue.slice(0, -1))}
                onClear={() => setFieldValue('')}
              />
              {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                送出答案
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
