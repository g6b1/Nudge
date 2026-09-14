import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowRight, ArrowLeft, Pause, Play, RotateCcw, Sparkles, Feather, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Routine, Activity } from '../types';
import { sounds } from '../utils/audio';

export const StartMyDayModal: React.FC = () => {
  const { 
    isStartMyDayOpen, setIsStartMyDayOpen, 
    routines, backpacks, toggleActivity, completeWholeRoutine,
    themeConfig, settings, showToast, setActiveTab
  } = useApp();

  const morningRoutines = routines.filter(r => r.isMorningRoutine || r.name.toLowerCase().includes('morning'));
  const fallbackRoutine = morningRoutines[0] || routines[0];

  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(fallbackRoutine ? fallbackRoutine.id : '');
  const [isLowEnergyVersion, setIsLowEnergyVersion] = useState<boolean>(settings.isLowEnergyMode);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(180);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  // Sync selected routine if fallback changes
  useEffect(() => {
    if (!selectedRoutineId && fallbackRoutine) {
      setSelectedRoutineId(fallbackRoutine.id);
    }
  }, [selectedRoutineId, fallbackRoutine]);

  const activeRoutine = routines.find(r => r.id === selectedRoutineId) || fallbackRoutine;

  // Filter activities if low energy version is chosen
  const activities: Activity[] = activeRoutine 
    ? (isLowEnergyVersion 
        ? activeRoutine.activities.filter(a => a.isLowEnergy !== false) 
        : activeRoutine.activities)
    : [];

  const currentActivity: Activity | undefined = activities[currentIndex];
  const nextActivity: Activity | undefined = activities[currentIndex + 1];

  // Reset timer on current activity change
  useEffect(() => {
    if (currentActivity?.durationMinutes) {
      setTimerSecondsRemaining(currentActivity.durationMinutes * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsRemaining(120);
      setIsTimerRunning(false);
    }
  }, [currentIndex, currentActivity]);

  // Timer countdown
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

  if (!isStartMyDayOpen || !activeRoutine) return null;

  const handleNext = () => {
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCheckCurrent = () => {
    if (!currentActivity) return;
    toggleActivity(activeRoutine.id, currentActivity.id);
    handleNext();
  };

  const handleFinishRoutine = () => {
    completeWholeRoutine(activeRoutine.id);
    setIsStartMyDayOpen(false);
    setShowSummary(false);

    if (activeRoutine.linkedBackpackId) {
      const bp = backpacks.find(b => b.id === activeRoutine.linkedBackpackId);
      if (bp) {
        showToast('Morning Routine Complete!', `Let's check your "${bp.name}".`, bp.emoji);
        setActiveTab('backpacks');
      }
    }
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
      id="start-my-day-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border"
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
            <span className="text-3xl">☀️</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Start My Day</h2>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: isLowEnergyVersion ? '#dcfce7' : themeConfig.accentSubtle,
                    color: isLowEnergyVersion ? '#15803d' : themeConfig.accent,
                  }}
                >
                  {isLowEnergyVersion ? '🌱 Gentle Quick' : '⚡ Full Morning'}
                </span>
              </div>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Nudge gentle morning assistant
              </p>
            </div>
          </div>

          <button
            id="close-start-my-day-btn"
            type="button"
            onClick={() => setIsStartMyDayOpen(false)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            style={{ color: themeConfig.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Routine & Low Energy Selector bar */}
        <div 
          className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{ borderColor: themeConfig.border }}
        >
          {/* Routine Switcher */}
          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: themeConfig.textSecondary }}>Routine:</span>
            <select
              id="start-day-routine-select"
              value={selectedRoutineId}
              onChange={(e) => {
                setSelectedRoutineId(e.target.value);
                setCurrentIndex(0);
              }}
              className="px-2.5 py-1.5 rounded-xl border font-medium outline-none cursor-pointer"
              style={{
                backgroundColor: themeConfig.bgMain,
                color: themeConfig.textPrimary,
                borderColor: themeConfig.border,
              }}
            >
              {morningRoutines.map(r => (
                <option key={r.id} value={r.id}>
                  {r.emoji} {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Low Energy Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl p-1 bg-black/5 dark:bg-white/5">
            <button
              id="start-day-mode-full-btn"
              type="button"
              onClick={() => {
                setIsLowEnergyVersion(false);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
                !isLowEnergyVersion ? 'shadow-sm text-white font-semibold' : ''
              }`}
              style={{
                backgroundColor: !isLowEnergyVersion ? themeConfig.accent : 'transparent',
                color: !isLowEnergyVersion ? '#ffffff' : themeConfig.textSecondary,
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Full</span>
            </button>
            <button
              id="start-day-mode-quick-btn"
              type="button"
              onClick={() => {
                setIsLowEnergyVersion(true);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
                isLowEnergyVersion ? 'shadow-sm text-emerald-800 font-semibold bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200' : ''
              }`}
              style={{
                color: isLowEnergyVersion ? undefined : themeConfig.textSecondary,
              }}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Low Energy</span>
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

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
          {!showSummary && currentActivity ? (
            <div className="flex flex-col items-center text-center my-auto">
              <span className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: themeConfig.textMuted }}>
                Activity {currentIndex + 1} of {activities.length}
              </span>

              {/* Big Emoji */}
              <motion.div
                key={currentActivity.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-sm"
                style={{
                  backgroundColor: `${currentActivity.color}25`,
                  border: `2px solid ${currentActivity.color}`,
                }}
              >
                {currentActivity.emoji}
              </motion.div>

              {/* Name */}
              <h3 className="text-2xl font-bold mb-2" style={{ color: themeConfig.textPrimary }}>
                {currentActivity.name}
              </h3>

              <p className="text-sm max-w-sm mb-6" style={{ color: themeConfig.textSecondary }}>
                {isLowEnergyVersion 
                  ? 'Take your time. A gentle, quiet pace is more than enough.' 
                  : 'Focus on just this step right now. You are doing great.'}
              </p>

              {/* Optional Timer */}
              <div 
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl mb-6 border"
                style={{
                  backgroundColor: themeConfig.bgMain,
                  borderColor: themeConfig.border,
                }}
              >
                <span className="font-mono text-xl font-bold tracking-wider" style={{ color: themeConfig.textPrimary }}>
                  {formatTime(timerSecondsRemaining)}
                </span>
                <button
                  id="start-day-timer-toggle-btn"
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  style={{ color: themeConfig.accent }}
                  title={isTimerRunning ? 'Pause timer' : 'Start timer'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  id="start-day-timer-reset-btn"
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
                  <span style={{ color: themeConfig.textMuted }}>Up next:</span>
                  <div className="flex items-center gap-2 font-medium" style={{ color: themeConfig.textSecondary }}>
                    <span>{nextActivity.emoji}</span>
                    <span>{nextActivity.name}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Routine Completion Summary */
            <div className="flex flex-col items-center text-center my-auto py-6">
              <span className="text-6xl mb-4">🌟</span>
              <h3 className="text-2xl font-bold mb-2">Morning Ready!</h3>
              <p className="text-sm max-w-sm mb-6" style={{ color: themeConfig.textSecondary }}>
                {isLowEnergyVersion 
                  ? "You listened to your body and took gentle care of yourself. That's a huge victory!" 
                  : "You've successfully set up your day for calm and clarity. Be proud of taking this time."}
              </p>

              <div className="w-full max-w-sm rounded-2xl p-4 mb-6 text-left border" style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span style={{ color: themeConfig.textMuted }}>Activities Completed</span>
                  <span className="font-bold" style={{ color: themeConfig.accent }}>{completedCount} of {activities.length}</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {activities.map(a => (
                    <div key={a.id} className="flex items-center gap-2 text-xs py-1 border-b border-black/5 dark:border-white/5 last:border-none">
                      <span>{a.emoji}</span>
                      <span className={a.completed ? 'line-through opacity-70' : ''} style={{ color: themeConfig.textPrimary }}>{a.name}</span>
                      {a.completed && <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>

              <button
                id="finish-start-my-day-btn"
                type="button"
                onClick={handleFinishRoutine}
                className="w-full max-w-sm py-3 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 text-white shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: themeConfig.accent }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Morning & Continue</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        {!showSummary && (
          <div 
            className="p-4 border-t flex items-center justify-between gap-3"
            style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgCardHover }}
          >
            <button
              id="start-day-prev-btn"
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
              id="start-day-skip-btn"
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-xs font-medium hover:underline transition-colors"
              style={{ color: themeConfig.textMuted }}
            >
              Skip
            </button>

            <button
              id="start-day-done-btn"
              type="button"
              onClick={handleCheckCurrent}
              className="px-6 py-2.5 rounded-2xl font-semibold flex items-center gap-2 text-xs text-white shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: themeConfig.accent }}
            >
              <Check className="w-4 h-4" />
              <span>{currentIndex === activities.length - 1 ? 'Finish' : 'Done & Next'}</span>
              {currentIndex < activities.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
