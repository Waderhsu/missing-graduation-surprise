import { AnimatePresence, motion } from 'motion/react';

interface ItemUnlockDialogProps {
  open: boolean;
  title: string;
  description?: string;
  icon?: string;
  onConfirm: () => void;
  confirmLabel?: string;
}

/** Modal shown when a backpack item is unlocked. */
export function ItemUnlockDialog({
  open,
  title,
  description,
  icon = '🎁',
  onConfirm,
  confirmLabel = '收入探險背包',
}: ItemUnlockDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 12 }}
            className="bg-[#1c1917] border border-amber-700/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
          >
            <div className="text-4xl">{icon}</div>
            <div className="space-y-2">
              <h3 className="text-amber-400 font-bold text-base">{title}</h3>
              {description && (
                <p className="text-xs text-stone-400 leading-relaxed">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition active:scale-95"
            >
              {confirmLabel}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
