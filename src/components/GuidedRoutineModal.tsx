import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Check, ArrowRight, ArrowLeft, Pause, Play, RotateCcw, ListChecks } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Activity } from '../types';
import { sounds } from '../utils/audio';

export const GuidedRoutineModal: React.FC = () => {
  const { 
    guidedRoutine, setGuidedRoutine, guidedRoutineLowEnergy,
    toggleActivity, completeWholeRoutine, themeConfig, showToast 
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(180);
  const [showOrderList, setShowOrderList] = useState<boolean>(false);

  // Filter if low energy mode active
  const activities: Activity[] = guidedRoutine
    ? (guidedRoutineLowEnergy 
        ? guidedRoutine.activities.filter(a => a.isLowEnergy !== false)
        : guidedRoutine.activities)
    : [];

  const currentActivity: Activity | undefined = activities[currentIndex];
  const nextActivity: Activity | undefined = activities[currentIndex + 1];

  useEffect(() => {
    if (currentActivity?.durationMinutes) {
      setTimerSecondsRemaining(currentActivity.durationMinutes * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsRemaining(120);
      setIsTimerRunning(false);
    }
  }, [currentIndex, currentActivity]);

  useEffect(() => {
    if (!isTimerRunning || timerSecondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimerSecondsRemaining(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          sounds.playCheck();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsRemaining]);

  if (!guidedRoutine) return null;

  const handleNext = () => {
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      completeWholeRoutine(guidedRoutine.id);
      setGuidedRoutine(null);
      showToast('Routine Completed!', `You've completed "${guidedRoutine.name}".`, guidedRoutine.emoji);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCheckCurrent = () => {
    if (!currentActivity) return;
    toggleActivity(guidedRoutine.id, currentActivity.id);
    handleNext();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${String(remainder).padStart(2, '0')}`;
  };

  const completedCount = activities.filter(a => a.completed).length;
  const progressPercent = activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0;

  return (
    <div 
      id="guided-routine-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: themeConfig.bgCard,
          color: themeConfig.textPrimary,
          borderColor: themeConfig.border,
        }}
      >
        {/* Header */}
        <div 
          className="p-5 flex items-center justify-between border-b"
          style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgCardHover }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{guidedRoutine.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{guidedRoutine.name}</h2>
                {guidedRoutineLowEnergy && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    Low Energy
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Activity {currentIndex + 1} of {activities.length} ({completedCount} completed)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="guided-toggle-order-btn"
              type="button"
              onClick={() => setShowOrderList(!showOrderList)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: showOrderList ? themeConfig.accent : themeConfig.textSecondary }}
              title="View all activities (jump or do out of order)"
            >
              <ListChecks className="w-5 h-5" />
            </button>
            <button
              id="close-guided-routine-btn"
              type="button"
              onClick={() => setGuidedRoutine(null)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: themeConfig.textSecondary }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 overflow-hidden">
          <div 
            className="h-full transition-all duration-300 rounded-r-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: themeConfig.accent,
            }}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center">
          {showOrderList ? (
            /* Complete out of order menu */
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">All Routine Activities</h4>
                <span className="text-xs" style={{ color: themeConfig.textMuted }}>Tap any to jump or mark</span>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {activities.map((act, idx) => (
                  <div 
                    key={act.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowOrderList(false);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      idx === currentIndex ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: idx === currentIndex ? themeConfig.accentSubtle : themeConfig.bgMain,
                      borderColor: themeConfig.border,
                      ringColor: themeConfig.accent,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{act.emoji}</span>
                      <div>
                        <p className={`text-sm font-medium ${act.completed ? 'line-through opacity-70' : ''}`}>
                          {act.name}
                        </p>
                        {act.durationMinutes && (
                          <span className="text-xs" style={{ color: themeConfig.textMuted }}>
                            ~{act.durationMinutes} min
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActivity(guidedRoutine.id, act.id);
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        act.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                      }`}
                    >
                      {act.completed && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : currentActivity ? (
            <div className="flex flex-col items-center text-center my-auto">
              <motion.div
                key={currentActivity.id}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-sm"
                style={{
                  backgroundColor: `${currentActivity.color}25`,
                  border: `2px solid ${currentActivity.color}`,
                }}
              >
                {currentActivity.emoji}
              </motion.div>

              <h3 className="text-2xl font-bold mb-2" style={{ color: themeConfig.textPrimary }}>
                {currentActivity.name}
              </h3>

              <p className="text-xs mb-6 font-medium" style={{ color: themeConfig.textSecondary }}>
                {currentActivity.durationMinutes ? `Target time: ${currentActivity.durationMinutes} minutes` : 'Take all the time you need'}
              </p>

              {/* Timer */}
              <div 
                className="flex items-center gap-3 px-4 py-2 rounded-2xl mb-6 border"
                style={{
                  backgroundColor: themeConfig.bgMain,
                  borderColor: themeConfig.border,
                }}
              >
                <span className="font-mono text-xl font-bold tracking-wider" style={{ color: themeConfig.textPrimary }}>
                  {formatTime(timerSecondsRemaining)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  style={{ color: themeConfig.accent }}
                  title={isTimerRunning ? 'Pause timer' : 'Start timer'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSecondsRemaining((currentActivity.durationMinutes || 2) * 60);
                  }}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  style={{ color: themeConfig.textMuted }}
                  title="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Next Step Preview */}
              {nextActivity && (
                <div 
                  className="w-full max-w-sm p-3 rounded-2xl flex items-center justify-between text-xs border"
                  style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
                >
                  <span style={{ color: themeConfig.textMuted }}>Next:</span>
                  <div className="flex items-center gap-2 font-medium" style={{ color: themeConfig.textSecondary }}>
                    <span>{nextActivity.emoji}</span>
                    <span>{nextActivity.name}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No activities in this routine.</p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div 
          className="p-4 border-t flex items-center justify-between gap-3"
          style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgCardHover }}
        >
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-2xl border flex items-center gap-1 text-xs font-semibold disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
            style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 text-xs font-medium hover:underline transition-colors"
            style={{ color: themeConfig.textMuted }}
          >
            Skip
          </button>

          <button
            type="button"
            onClick={handleCheckCurrent}
            className="px-6 py-2.5 rounded-2xl font-semibold flex items-center gap-2 text-xs text-white shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: themeConfig.accent }}
          >
            <Check className="w-4 h-4" />
            <span>{currentIndex === activities.length - 1 ? 'Finish Routine' : 'Done & Next'}</span>
            {currentIndex < activities.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
