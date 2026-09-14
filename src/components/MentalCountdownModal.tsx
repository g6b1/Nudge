import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Volume2, VolumeX, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

export const MentalCountdownModal: React.FC = () => {
  const { countdownData, setCountdownData, settings, themeConfig } = useApp();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [soundMuted, setSoundMuted] = useState(false);

  useEffect(() => {
    if (!countdownData) return;
    const initial = countdownData.durationSeconds || settings.countdownDuration || 5;
    setSecondsRemaining(initial);
  }, [countdownData, settings.countdownDuration]);

  useEffect(() => {
    if (!countdownData) return;

    if (secondsRemaining <= 0) {
      if (settings.countdownSound && !soundMuted) {
        sounds.playLaunch();
      }
      if (settings.countdownVibrate) {
        sounds.vibrate([80, 100, 150]);
      }
      const onComplete = countdownData.onComplete;
      setCountdownData(null);
      onComplete();
      return;
    }

    if (settings.countdownSound && !soundMuted) {
      sounds.playTick();
    }
    if (settings.countdownVibrate) {
      sounds.vibrate(30);
    }

    const timer = setTimeout(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownData, secondsRemaining, settings.countdownSound, settings.countdownVibrate, soundMuted, setCountdownData]);

  if (!countdownData) return null;

  const handleStartNow = () => {
    if (settings.countdownSound && !soundMuted) {
      sounds.playLaunch();
    }
    const onComplete = countdownData.onComplete;
    setCountdownData(null);
    onComplete();
  };

  const handleCancel = () => {
    setCountdownData(null);
  };

  return (
    <AnimatePresence>
      <div 
        id="mental-countdown-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          className="relative w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center justify-center"
          style={{
            backgroundColor: themeConfig.bgCard,
            color: themeConfig.textPrimary,
            borderColor: themeConfig.border,
          }}
        >
          {/* Close & Sound Toggles */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              id="countdown-mute-btn"
              type="button"
              onClick={() => setSoundMuted(!soundMuted)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: themeConfig.textSecondary }}
              title="Toggle sound"
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              id="countdown-cancel-btn"
              type="button"
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: themeConfig.textSecondary }}
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-4xl mb-2">{countdownData.emoji || '🚀'}</div>
          
          <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: themeConfig.textPrimary }}>
            {countdownData.title}
          </h2>
          
          <p className="text-sm mb-6" style={{ color: themeConfig.textSecondary }}>
            Take a breath. No pressure, just a gentle start.
          </p>

          {/* Number Display */}
          <div className="relative my-4 flex items-center justify-center">
            <motion.div
              key={secondsRemaining}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-32 h-32 rounded-full flex items-center justify-center shadow-inner font-extrabold text-6xl"
              style={{
                backgroundColor: themeConfig.accentSubtle,
                color: themeConfig.accent,
                border: `3px solid ${themeConfig.accent}`,
              }}
            >
              {secondsRemaining > 0 ? secondsRemaining : 'GO!'}
            </motion.div>
          </div>

          <p className="text-xs font-medium tracking-wide uppercase mt-4 mb-6" style={{ color: themeConfig.textMuted }}>
            {secondsRemaining > 0 ? 'Mental Countdown' : 'Launching...'}
          </p>

          {/* Start Now Button */}
          <div className="w-full flex flex-col gap-2">
            <button
              id="countdown-start-now-btn"
              type="button"
              onClick={handleStartNow}
              className="w-full py-3 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-95 transition-all text-white cursor-pointer"
              style={{ backgroundColor: themeConfig.accent }}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Right Now</span>
            </button>
            <button
              id="countdown-dismiss-btn"
              type="button"
              onClick={handleCancel}
              className="w-full py-2 text-xs font-medium hover:underline transition-colors"
              style={{ color: themeConfig.textSecondary }}
            >
              Not quite ready, dismiss
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
