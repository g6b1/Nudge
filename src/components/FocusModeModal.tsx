import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Play, Pause, RotateCcw, Check, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

export const FocusModeModal: React.FC = () => {
  const { focusModeItem, setFocusModeItem, themeConfig, showToast } = useApp();

  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ambientAudioOn, setAmbientAudioOn] = useState<boolean>(false);

  useEffect(() => {
    if (focusModeItem?.duration) {
      setSecondsRemaining(focusModeItem.duration * 60);
    } else {
      setSecondsRemaining(15 * 60);
    }
    setIsRunning(false);
  }, [focusModeItem]);

  useEffect(() => {
    if (!isRunning || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          sounds.playCheck();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  if (!focusModeItem) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleComplete = () => {
    sounds.playCheck();
    showToast('Focus Task Completed', `Well done focusing on "${focusModeItem.title}"!`, focusModeItem.emoji);
    setFocusModeItem(null);
  };

  return (
    <div id="focus-mode-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-xl flex flex-col items-center justify-between min-h-[70vh] p-8 text-center text-white relative">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-stone-300">
              Distraction-Free Focus
            </span>
          </div>

          <button
            id="close-focus-mode-btn"
            onClick={() => setFocusModeItem(null)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Exit Focus Mode"
          >
            <X className="w-5 h-5 text-stone-300" />
          </button>
        </div>

        {/* Center: Hero task and timer */}
        <div className="my-auto flex flex-col items-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-28 h-28 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-6xl mb-6 shadow-2xl"
          >
            {focusModeItem.emoji || '🎯'}
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            {focusModeItem.title}
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 mb-8 max-w-xs leading-relaxed">
            Only this one thing exists right now. Breathe softly and take it one moment at a time.
          </p>

          {/* Large Minimal Timer */}
          <div className="font-mono text-5xl sm:text-6xl font-black tracking-widest text-stone-100 mb-6 drop-shadow-md">
            {formatTime(secondsRemaining)}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-4 rounded-full bg-white text-black hover:bg-stone-200 transition-transform active:scale-95 shadow-xl"
              title={isRunning ? 'Pause' : 'Play'}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setSecondsRemaining((focusModeItem.duration || 15) * 60);
              }}
              className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-stone-300"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Finish button */}
        <div className="w-full flex items-center justify-center gap-4 pt-6">
          <button
            onClick={handleComplete}
            className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Complete This Step</span>
          </button>
        </div>
      </div>
    </div>
  );
};
