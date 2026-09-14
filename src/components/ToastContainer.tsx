import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

interface ToastItemProps {
  toast: {
    id: string;
    title: string;
    message: string;
    emoji?: string;
    timestamp: number;
  };
  onDismiss: () => void;
  themeConfig: any;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, themeConfig }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const duration = 3000; // exactly 3 seconds
    const startTime = performance.now();

    const frame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(frame);
      } else {
        onDismiss();
      }
    };

    animationFrameId = requestAnimationFrame(frame);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="p-4 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md pointer-events-auto relative overflow-hidden"
      style={{
        backgroundColor: themeConfig.bgCard,
        borderColor: themeConfig.border,
        color: themeConfig.textPrimary,
      }}
    >
      {toast.emoji && (
        <span className="text-2xl p-1.5 rounded-xl bg-black/5 dark:bg-white/5 shrink-0">
          {toast.emoji}
        </span>
      )}
      <div className="flex-1 overflow-hidden pr-2">
        <h4 className="font-bold text-xs" style={{ color: themeConfig.textPrimary }}>
          {toast.title}
        </h4>
        <p className="text-[11px] truncate" style={{ color: themeConfig.textSecondary }}>
          {toast.message}
        </p>
      </div>

      {/* Subtle bottom time-progress bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/10 overflow-hidden"
      >
        <div 
          className="h-full rounded-r-full transition-[width] duration-75 ease-linear"
          style={{
            width: `${progress}%`,
            backgroundColor: themeConfig.accent,
          }}
        />
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toast, dismissToast, themeConfig } = useApp();

  return (
    <div 
      id="nudge-toast-container"
      className="fixed bottom-5 left-0 right-0 sm:left-auto sm:right-5 z-50 pointer-events-none max-w-sm w-full px-4 sm:px-0 ml-auto"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
            themeConfig={themeConfig}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
