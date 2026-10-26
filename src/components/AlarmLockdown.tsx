import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from './AudioEngine';
import { ImagePlaceholder } from './ImagePlaceholder';
import { LevelHeader } from './LevelHeader';
import { LetterKeyboard } from './LetterKeyboard';
import { LEVEL_IMAGES } from '../levelAssets';

interface AlarmLockdownProps {
  onSuccess: () => void;
  onFailure: () => void;
}

/** Alarm countdown seconds (default 5 min = 300). Change here to adjust. */
export const ALARM_COUNTDOWN_SECONDS = 5 * 60;

const INITIAL_SECONDS = ALARM_COUNTDOWN_SECONDS;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function AlarmLockdown({ onSuccess, onFailure }: AlarmLockdownProps) {
  const [timeLeft, setTimeLeft] = useState(INITIAL_SECONDS);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [alarmOn, setAlarmOn] = useState(true);
  const stopAlarmRef = useRef<(() => void) | null>(null);
  const timedOutRef = useRef(false);
  const onFailureRef = useRef(onFailure);
  onFailureRef.current = onFailure;

  const isUrgent = timeLeft <= 60;

  useEffect(() => {
    if (alarmOn) {
      stopAlarmRef.current = audioEngine.startAlarmBeeps();
    } else if (stopAlarmRef.current) {
      stopAlarmRef.current();
      stopAlarmRef.current = null;
    }
    return () => {
      stopAlarmRef.current?.();
    };
  }, [alarmOn]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;
        if (!timedOutRef.current) {
          timedOutRef.current = true;
          stopAlarmRef.current?.();
          stopAlarmRef.current = null;
          audioEngine.playBeep(150, 1, 'sawtooth');
          audioEngine.playBeep(110, 0.8, 'sawtooth');
          onFailureRef.current();
        }
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const submit = () => {
    if (answer.trim().toLowerCase() === 'math') {
      audioEngine.playBeep(987, 0.1);
      audioEngine.playBeep(1318, 0.3);
      stopAlarmRef.current?.();
      onSuccess();
    } else {
      setError('密碼錯誤');
      audioEngine.playBeep(200, 0.5);
      setAnswer('');
      window.setTimeout(() => setError(''), 2200);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 border-b border-red-900/30 pb-3">
        <LevelHeader title="中斷警報" className="border-none pb-0 flex-1" />
        <button
          type="button"
          onClick={() => setAlarmOn(!alarmOn)}
          className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition ${
            alarmOn
              ? 'bg-red-950/40 border-red-800/50 text-red-300'
              : 'bg-stone-900 border-stone-800 text-stone-400'
          }`}
        >
          {alarmOn ? <Volume2 className="h-4 w-4 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
          {alarmOn ? '警報聲 ON' : '警報聲 OFF'}
        </button>
      </div>

      <p className="text-stone-300 leading-relaxed text-sm sm:text-base">
        糟了！警衛室大門剛開啟，室內感應器就偵測到非預期移動。紅燈瘋狂閃爍，廣播系統響起低沉的警告音：「偵測到入侵，5 分鐘後將全面封鎖並通報警方。」
        你衝向警衛室裡的電腦，必須在時間耗盡前解開消音頻率並終止警報！
      </p>

      <p className="text-sm text-stone-400 leading-relaxed bg-stone-900/50 border border-stone-800 rounded-xl p-3">
        目前的干擾頻率為非穩定狀態，請找出「缺失的頻率數值」以及「關鍵頻率的所在位置」，並轉化為代碼中斷警報。
      </p>

      <div
        className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${
          isUrgent
            ? 'bg-red-950/50 border-red-600/60 animate-pulse'
            : 'bg-red-950/25 border-red-900/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`relative flex h-3 w-3 ${alarmOn ? '' : 'opacity-40'}`}>
            {alarmOn && <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />}
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <span className="text-xs font-mono text-red-300 uppercase tracking-wider">警報啟動中</span>
        </div>
        <span className={`font-mono text-2xl sm:text-3xl font-black tabular-nums ${isUrgent ? 'text-red-400' : 'text-red-500/90'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Photo left · input + keyboard right (stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
        <div className="space-y-3">
          <ImagePlaceholder src={LEVEL_IMAGES.alarm} alt="警報系統畫面" className="w-full max-w-md mx-auto lg:mx-0" />
          <div className="bg-[#0a0f0d] border border-[#22c55e]/25 rounded-xl p-3 font-mono shadow-inner space-y-2">
            <div className="text-[#22c55e] text-center text-lg sm:text-xl font-bold tracking-widest">
              ? ? 10 17 26 ?? 50
            </div>
            <p className="text-[11px] leading-relaxed text-amber-200/80 bg-amber-950/20 border border-amber-700/30 rounded-lg p-2.5">
              ⚠️系統警告：本機無法讀取超出對照表上限的未知頻率，若遇超載數值，請將其拆解為獨立的單一訊號，再逐一進行轉譯。
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-5 space-y-3">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-widest block">
              輸入消音頻率代碼
            </span>
            <div className="w-full py-3.5 border border-stone-700 bg-stone-900 font-mono tracking-[0.45em] text-[#22c55e] rounded-lg text-center text-xl uppercase font-bold min-h-[52px]">
              {answer || '----'}
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm font-semibold text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 sm:p-5">
            <LetterKeyboard
              onKey={(ch) => {
                setError('');
                setAnswer((prev) => (prev.length < 8 ? prev + ch : prev));
                audioEngine.playBeep(440, 0.05);
              }}
              onBackspace={() => setAnswer((prev) => prev.slice(0, -1))}
              onClear={() => setAnswer('')}
              onSubmit={submit}
              submitLabel="中斷警報器"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
