import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Flame, Check, Sparkles, Play, AlertTriangle, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WidgetsModal: React.FC = () => {
  const { 
    isWidgetsModalOpen, setIsWidgetsModalOpen, 
    routines, checklists, backpacks, streak, themeConfig,
    launchMentalCountdown 
  } = useApp();

  const [widgetSize, setWidgetSize] = useState<'small' | 'medium' | 'large'>('medium');

  if (!isWidgetsModalOpen) return null;

  const firstRoutine = routines[0];
  const firstChecklist = checklists[0];
  const firstBackpack = backpacks[0];

  return (
    <div id="widgets-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
          color: themeConfig.textPrimary,
        }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeConfig.border }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">Home-Screen Widgets Preview</h2>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Live preview of interactive widgets for phone & tablet home screens.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWidgetsModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: themeConfig.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Size switcher */}
        <div className="p-3 border-b flex items-center justify-center gap-2" style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgMain }}>
          {(['small', 'medium', 'large'] as const).map(size => (
            <button
              key={size}
              onClick={() => setWidgetSize(size)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                widgetSize === size ? 'bg-white dark:bg-stone-800 shadow-xs ring-1 ring-black/5' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                color: widgetSize === size ? themeConfig.textPrimary : themeConfig.textSecondary,
              }}
            >
              {size} Widget
            </button>
          ))}
        </div>

        {/* Widget Canvas */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-950">
          {/* Widget 1: Today's Routine & Next Action */}
          <div className="w-full max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-stone-500">
              1. Next Activity & Flow Widget
            </p>
            <div 
              className={`rounded-3xl border shadow-xl p-5 flex flex-col justify-between transition-all ${
                widgetSize === 'small' ? 'h-40 max-w-[170px]' : widgetSize === 'medium' ? 'h-40' : 'h-64'
              }`}
              style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{firstRoutine?.emoji || '☀️'}</span>
                  <div>
                    <h3 className="font-bold text-xs truncate">{firstRoutine?.name || 'Daily Routine'}</h3>
                    <p className="text-[10px] text-stone-400">Next up</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                  Nudge
                </span>
              </div>

              {firstRoutine?.activities[0] && (
                <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{firstRoutine.activities[0].emoji}</span>
                    <span className="text-xs font-semibold">{firstRoutine.activities[0].name}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">~{firstRoutine.activities[0].durationMinutes || 2}m</span>
                </div>
              )}

              {widgetSize === 'large' && (
                <div className="space-y-1 text-xs">
                  <p className="text-[10px] text-stone-400 font-bold uppercase">Remaining</p>
                  {firstRoutine?.activities.slice(1, 3).map(a => (
                    <div key={a.id} className="flex items-center gap-1.5 opacity-70">
                      <span>{a.emoji}</span>
                      <span className="truncate">{a.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[11px]">
                <span className="text-stone-400">1-Tap Start</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsWidgetsModalOpen(false);
                    launchMentalCountdown('Routine Widget Start', () => {}, '🚀');
                  }}
                  className="px-3 py-1 rounded-xl text-white font-bold text-[10px] flex items-center gap-1"
                  style={{ backgroundColor: themeConfig.accent }}
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Start</span>
                </button>
              </div>
            </div>
          </div>

          {/* Widget 2: 5-Second Start Quick Launcher */}
          <div className="w-full max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-stone-500">
              2. 5-Second Initiation Widget
            </p>
            <div 
              onClick={() => {
                setIsWidgetsModalOpen(false);
                launchMentalCountdown('5-Second Widget Blastoff', () => {}, '🚀');
              }}
              className="p-5 rounded-3xl border shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform"
              style={{ backgroundColor: themeConfig.accent, borderColor: themeConfig.accent, color: '#ffffff' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                <div>
                  <h4 className="font-extrabold text-sm">5-Second Launch</h4>
                  <p className="text-xs opacity-90">Tap to shatter procrastination</p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-2xl bg-white/20 text-xs font-bold backdrop-blur-xs">
                5 • 4 • 3 • 2 • 1
              </span>
            </div>
          </div>

          {/* Widget 3: Streak & Recovery Badge */}
          <div className="w-full max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-stone-500">
              3. Gentle Streak & Mindful Goal
            </p>
            <div 
              className="p-4 rounded-3xl border shadow-xl flex items-center justify-between"
              style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-xl font-bold">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-xs" style={{ color: themeConfig.textPrimary }}>
                    {streak.currentStreak} Day Gentle Streak
                  </h4>
                  <p className="text-[10px]" style={{ color: themeConfig.textMuted }}>
                    Grace days available: safe from zero
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">On Track 🌱</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
