import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';

export type StarPoint = { x: number; y: number };

interface StarFlightOverlayProps {
  from: StarPoint[];
  /** When null, stars hold at `from`. When set, they fly to these targets. */
  to: StarPoint[] | null;
  onComplete: () => void;
  duration?: number;
}

/**
 * Fixed-layer stars: hold at previous-level screen coords, then fly to next-level targets.
 */
export function StarFlightOverlay({ from, to, onComplete, duration = 2.2 }: StarFlightOverlayProps) {
  const [flying, setFlying] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const completedRef = useRef(false);
  const n = from.length;

  useEffect(() => {
    if (!to || to.length < n) return;
    setDoneCount(0);
    completedRef.current = false;
    // One frame hold so the overlay paints at `from` before animating.
    const id = window.requestAnimationFrame(() => setFlying(true));
    return () => window.cancelAnimationFrame(id);
  }, [to, n]);

  useEffect(() => {
    if (!flying || n === 0) return;
    if (doneCount < n) return;
    if (completedRef.current) return;
    completedRef.current = true;
    const t = window.setTimeout(onComplete, 200);
    return () => window.clearTimeout(t);
  }, [doneCount, flying, n, onComplete]);

  if (typeof document === 'undefined' || n === 0) return null;

  const targets = to && to.length >= n ? to : from;

  return createPortal(
    <div className="fixed inset-0 z-[90] pointer-events-none overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-0 bg-[#0a0a0b]/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: flying ? 0.35 : 0.55 }}
        transition={{ duration: 0.4 }}
      />
      {from.map((src, i) => (
        <motion.span
          key={i}
          className="absolute text-4xl sm:text-5xl -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_18px_rgba(251,191,36,1)]"
          initial={false}
          animate={{
            left: flying ? targets[i].x : src.x,
            top: flying ? targets[i].y : src.y,
            scale: flying ? 1 : 1.12,
            rotate: flying ? 0 : -8,
          }}
          transition={
            flying
              ? { duration, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0 }
          }
          onAnimationComplete={() => {
            if (flying) setDoneCount((c) => c + 1);
          }}
        >
          ⭐
        </motion.span>
      ))}
      <motion.p
        className="absolute bottom-10 left-0 right-0 text-center text-xs text-amber-300/90 tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {flying ? '六星圖騰對應至平板星圖…' : '六星圖騰轉移中…'}
      </motion.p>
    </div>,
    document.body,
  );
}
