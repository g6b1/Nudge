import React, { useState } from 'react';
import { 
  Play, Sparkles, Check, ChevronRight, AlertTriangle, 
  Copy, Calendar, ArrowRight, Plus, RefreshCw, Feather, Zap, Flame, Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Routine, Checklist, Backpack, CalendarEvent } from '../types';
import { getTodayDateString } from '../utils/storage';
import { MOTIVATIONAL_TIPS } from '../data/motivationalTips';

export const TodayDashboard: React.FC = () => {
  const { 
    settings, themeConfig, routines, checklists, backpacks, calendarEvents,
    streak, isLowEnergy, toggleLowEnergyMode,
    setIsStartMyDayOpen, setGuidedRoutine, launchMentalCountdown,
    toggleActivity, toggleChecklistItem, toggleBackpackItem,
    resetChecklist, resetBackpack, packAllBackpackItems,
    setIsPlanTomorrowOpen, setIsCopyDayOpen, setIsQuickAddOpen,
    setActiveTab, addBrainDumpItem, searchQuery
  } = useApp();

  const [quickBrainDumpText, setQuickBrainDumpText] = useState('');
  const [currentMotivationalTip] = useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_TIPS.length);
    return MOTIVATIONAL_TIPS[randomIndex];
  });

  // Time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    let icon = '☀️';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
      icon = '🌤️';
    } else if (hour >= 17 && hour < 22) {
      timeGreeting = 'Good evening';
      icon = '🌙';
    } else if (hour >= 22 || hour < 5) {
      timeGreeting = 'Quiet night';
      icon = '✨';
    }

    const name = settings.firstName ? `, ${settings.firstName}` : '';
    return { text: `${timeGreeting}${name}`, icon };
  };

  const greeting = getGreeting();

  // Formatted date string
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const todayStr = getTodayDateString();

  // Active unarchived items
  const activeRoutines = routines.filter(r => !r.isArchived);
  const activeChecklists = checklists.filter(c => !c.isArchived);
  const activeBackpacks = backpacks.filter(b => !b.isArchived);

  // Filter based on search query if any
  const filterQuery = searchQuery.toLowerCase().trim();
  const displayRoutines = filterQuery 
    ? activeRoutines.filter(r => r.name.toLowerCase().includes(filterQuery) || r.activities.some(a => a.name.toLowerCase().includes(filterQuery)))
    : activeRoutines;
  const displayChecklists = filterQuery
    ? activeChecklists.filter(c => c.name.toLowerCase().includes(filterQuery) || c.items.some(i => i.title.toLowerCase().includes(filterQuery)))
    : activeChecklists;
  const displayBackpacks = filterQuery
    ? activeBackpacks.filter(b => b.name.toLowerCase().includes(filterQuery) || b.items.some(i => i.name.toLowerCase().includes(filterQuery)))
    : activeBackpacks;

  // Daily goal calculation
  let totalTasks = 0;
  let completedTasks = 0;

  activeRoutines.forEach(r => {
    r.activities.forEach(a => {
      totalTasks++;
      if (a.completed) completedTasks++;
    });
  });

  activeChecklists.forEach(c => {
    c.items.forEach(i => {
      totalTasks++;
      if (i.completed) completedTasks++;
    });
  });

  activeBackpacks.forEach(b => {
    b.items.forEach(i => {
      totalTasks++;
      if (i.isPacked) completedTasks++;
    });
  });

  const dailyPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleQuickBrainDumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBrainDumpText.trim()) return;
    addBrainDumpItem(quickBrainDumpText);
    setQuickBrainDumpText('');
  };

  return (
    <div id="today-dashboard" className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div 
        className="rounded-3xl p-6 sm:p-8 border shadow-sm relative overflow-hidden transition-all"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{greeting.icon}</span>
              <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: themeConfig.textMuted }}>
                {todayFormatted}
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: themeConfig.textPrimary }}>
              {greeting.text}
            </h1>
            <p className="text-sm max-w-lg" style={{ color: themeConfig.textSecondary }}>
              {isLowEnergy 
                ? 'Low Energy mode is on today. Move gently and do only what feels manageable.'
                : 'Here is your gentle view of today. Take things one micro-step at a time.'}
            </p>
          </div>

          {/* Quick Start Buttons */}
          <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 md:gap-2.5 sm:self-center shrink-0 max-w-full overflow-x-auto scrollbar-none">
            {/* Start My Day Button */}
            <button
              id="today-start-my-day-btn"
              type="button"
              onClick={() => setIsStartMyDayOpen(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
              style={{ backgroundColor: themeConfig.accent }}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Start My Day</span>
            </button>

            {/* 5-Second Countdown / Just Start Button */}
            <button
              id="today-just-start-btn"
              type="button"
              onClick={() => {
                const firstRoutine = activeRoutines[0];
                launchMentalCountdown(
                  firstRoutine ? `Starting ${firstRoutine.name}` : 'First Daily Task',
                  () => {
                    if (firstRoutine) setGuidedRoutine(firstRoutine, isLowEnergy);
                  },
                  '🚀'
                );
              }}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl text-xs font-semibold border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap shrink-0"
              style={{
                borderColor: themeConfig.border,
                color: themeConfig.textPrimary,
                backgroundColor: themeConfig.bgMain,
              }}
              title={`Overcome procrastination with a gentle ${(settings.countdownDuration ?? settings.defaultCountdownDuration) || 10}-second countdown`}
            >
              <span className="shrink-0">⏱️</span>
              <span>{`${(settings.countdownDuration ?? settings.defaultCountdownDuration) || 10}-Sec Start`}</span>
            </button>

            {/* Plan Tomorrow & Copy Day Tools */}
            <button
              id="today-plan-tomorrow-btn"
              type="button"
              onClick={() => setIsPlanTomorrowOpen(true)}
              className="p-2 sm:p-2.5 rounded-2xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shrink-0 flex items-center justify-center"
              style={{
                borderColor: themeConfig.border,
                color: themeConfig.textSecondary,
                backgroundColor: themeConfig.bgMain,
              }}
              title="Plan Tomorrow"
            >
              <Calendar className="w-4 h-4 shrink-0" />
            </button>

            <button
              id="today-copy-day-btn"
              type="button"
              onClick={() => setIsCopyDayOpen(true)}
              className="p-2 sm:p-2.5 rounded-2xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shrink-0 flex items-center justify-center"
              style={{
                borderColor: themeConfig.border,
                color: themeConfig.textSecondary,
                backgroundColor: themeConfig.bgMain,
              }}
              title="Copy This Day's Schedule"
            >
              <Copy className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Daily Goal & Streak Progress strip */}
        <div 
          className="mt-6 pt-5 border-t space-y-3.5 text-xs"
          style={{ borderColor: themeConfig.border }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0">
              {/* Daily Progress */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="w-16 bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden shrink-0">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${dailyPercentage}%`, backgroundColor: themeConfig.accent }}
                  />
                </div>
                <span className="font-bold whitespace-nowrap" style={{ color: themeConfig.textPrimary }}>
                  {dailyPercentage}% complete today
                </span>
                <span className="whitespace-nowrap" style={{ color: themeConfig.textMuted }}>
                  ({completedTasks}/{totalTasks} nudges)
                </span>
              </div>

              {/* Streak indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold shrink-0">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>{streak.currentStreak} Day Streak</span>
              </div>

              {/* Recovery badge if user returned after a break */}
              {streak.recoveryDaysCount > 0 && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium shrink-0">
                  <span>🌱 Returned & Rebuilding ({streak.recoveryDaysCount}x)</span>
                </div>
              )}
            </div>
          </div>

          {/* Rotating Motivational Tip: Under the percentage-completion text, above the mode displayer */}
          <div 
            id="home-motivational-tip" 
            className="flex items-start gap-1.5 text-xs py-0.5"
            style={{ color: themeConfig.textSecondary }}
          >
            <span className="shrink-0 text-xs select-none">💡</span>
            <p className="italic leading-relaxed">
              {currentMotivationalTip}
            </p>
          </div>

          {/* Mode Displayer */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs pt-0.5">
            <div className="flex items-center gap-2">
              <span style={{ color: themeConfig.textMuted }}>Mode:</span>
              <button
                onClick={toggleLowEnergyMode}
                className="font-medium hover:underline flex items-center gap-1 cursor-pointer"
                style={{ color: isLowEnergy ? '#15803d' : themeConfig.accent }}
              >
                {isLowEnergy ? <Feather className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                <span>{isLowEnergy ? 'Low Energy Active' : 'Normal Pace'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Brain Dump Input Bar */}
      <form 
        onSubmit={handleQuickBrainDumpSubmit}
        className="p-3 rounded-2xl border flex items-center gap-2 shadow-xs transition-all"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
        }}
      >
        <span className="text-lg pl-1">💡</span>
        <input
          id="today-brain-dump-input"
          type="text"
          placeholder="Jot a quick thought, task, or reminder into Brain Dump..."
          value={quickBrainDumpText}
          onChange={(e) => setQuickBrainDumpText(e.target.value)}
          className="flex-1 bg-transparent text-xs sm:text-sm outline-none"
          style={{ color: themeConfig.textPrimary }}
        />
        <button
          id="today-brain-dump-submit-btn"
          type="submit"
          disabled={!quickBrainDumpText.trim()}
          className="p-2 rounded-xl text-white disabled:opacity-40 transition-all cursor-pointer"
          style={{ backgroundColor: themeConfig.accent }}
          title="Save to Brain Dump"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Grid: Routines, Checklists, Backpacks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Today's Routines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔄</span>
              <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                Today's Routines
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('routines')}
              className="text-xs font-semibold hover:underline flex items-center gap-0.5"
              style={{ color: themeConfig.accent }}
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {displayRoutines.map((routine: Routine) => {
              const activities = isLowEnergy 
                ? routine.activities.filter(a => a.isLowEnergy !== false)
                : routine.activities;
              const doneCount = activities.filter(a => a.completed).length;
              const allDone = activities.length > 0 && doneCount === activities.length;

              return (
                <div
                  key={routine.id}
                  id={`today-routine-${routine.id}`}
                  className="p-4 rounded-2xl border transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: themeConfig.bgCard,
                    borderColor: themeConfig.border,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{routine.emoji}</span>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: themeConfig.textPrimary }}>
                          {routine.name}
                        </h3>
                        <p className="text-[11px]" style={{ color: themeConfig.textMuted }}>
                          ~{routine.estimatedDuration} min • {doneCount}/{activities.length} done
                        </p>
                      </div>
                    </div>

                    <button
                      id={`start-guided-${routine.id}`}
                      type="button"
                      onClick={() => {
                        launchMentalCountdown(
                          `Starting ${routine.name}`,
                          () => setGuidedRoutine(routine, isLowEnergy),
                          routine.emoji
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs hover:opacity-90 active:scale-95 cursor-pointer text-white"
                      style={{ backgroundColor: routine.color || themeConfig.accent }}
                      title="Start guided routine with timer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Guided</span>
                    </button>
                  </div>

                  {/* Activities list with swipe/tap to check off */}
                  <div className="space-y-1.5 mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                    {activities.slice(0, 5).map(act => (
                      <div
                        key={act.id}
                        onClick={() => toggleActivity(routine.id, act.id)}
                        className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                          act.completed ? 'opacity-60 bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden min-w-0">
                          <span className="shrink-0">{act.emoji}</span>
                          <span className={`truncate min-w-0 ${act.completed ? 'line-through' : 'font-medium'}`} style={{ color: themeConfig.textPrimary }}>
                            {act.name}
                          </span>
                        </div>
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            act.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {act.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                    {activities.length > 5 && (
                      <button
                        onClick={() => setGuidedRoutine(routine, isLowEnergy)}
                        className="w-full text-center py-1 text-[11px] font-medium hover:underline"
                        style={{ color: themeConfig.accent }}
                      >
                        +{activities.length - 5} more activities...
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {displayRoutines.length === 0 && (
              <div className="p-6 rounded-2xl border text-center text-xs" style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}>
                <p style={{ color: themeConfig.textMuted }}>No routines match your view.</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Today's Checklists */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                Today's Checklists
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('checklists')}
              className="text-xs font-semibold hover:underline flex items-center gap-0.5"
              style={{ color: themeConfig.accent }}
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {displayChecklists.map((checklist: Checklist) => {
              const doneCount = checklist.items.filter(i => i.completed).length;
              const allDone = checklist.items.length > 0 && doneCount === checklist.items.length;

              return (
                <div
                  key={checklist.id}
                  id={`today-checklist-${checklist.id}`}
                  className="p-4 rounded-2xl border transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: themeConfig.bgCard,
                    borderColor: themeConfig.border,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{checklist.emoji}</span>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: themeConfig.textPrimary }}>
                          {checklist.name}
                        </h3>
                        <p className="text-[11px]" style={{ color: themeConfig.textMuted }}>
                          {doneCount}/{checklist.items.length} items checked
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => resetChecklist(checklist.id)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Reset checklist items"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Items list with swipe/tap to check off */}
                  <div className="space-y-1.5 mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                    {checklist.items.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(checklist.id, item.id)}
                        className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                          item.completed ? 'opacity-60 bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden min-w-0">
                          <span className="shrink-0">{item.emoji || '✓'}</span>
                          <span className={`truncate min-w-0 ${item.completed ? 'line-through' : 'font-medium'}`} style={{ color: themeConfig.textPrimary }}>
                            {item.title}
                          </span>
                        </div>
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                    {checklist.items.length > 5 && (
                      <button
                        onClick={() => setActiveTab('checklists')}
                        className="w-full text-center py-1 text-[11px] font-medium hover:underline"
                        style={{ color: themeConfig.accent }}
                      >
                        +{checklist.items.length - 5} more items...
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {displayChecklists.length === 0 && (
              <div className="p-6 rounded-2xl border text-center text-xs" style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}>
                <p style={{ color: themeConfig.textMuted }}>No checklists found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Today's Backpacks & Belongings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎒</span>
              <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                Today's Backpacks
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('backpacks')}
              className="text-xs font-semibold hover:underline flex items-center gap-0.5"
              style={{ color: themeConfig.accent }}
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {displayBackpacks.map((backpack: Backpack) => {
              const packedCount = backpack.items.filter(i => i.isPacked).length;
              const allPacked = backpack.items.length > 0 && packedCount === backpack.items.length;
              const missingRequired = backpack.items.filter(i => i.isRequired && !i.isPacked);

              return (
                <div
                  key={backpack.id}
                  id={`today-backpack-${backpack.id}`}
                  className="p-4 rounded-2xl border transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: themeConfig.bgCard,
                    borderColor: themeConfig.border,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{backpack.emoji}</span>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: themeConfig.textPrimary }}>
                          {backpack.name}
                        </h3>
                        <p className="text-[11px]" style={{ color: themeConfig.textMuted }}>
                          {packedCount}/{backpack.items.length} packed
                        </p>
                      </div>
                    </div>

                    <button
                      id={`pack-all-btn-${backpack.id}`}
                      type="button"
                      onClick={() => packAllBackpackItems(backpack.id)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold border hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                      title="Pack all items at once"
                    >
                      Pack All
                    </button>
                  </div>

                  {/* Missing Item Warning if any required are unpacked */}
                  {missingRequired.length > 0 && (
                    <div className="mb-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] flex items-center gap-1.5 min-w-0">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate min-w-0">Missing essential: {missingRequired.map(m => m.name).join(', ')}</span>
                    </div>
                  )}

                  {/* Items list with swipe/tap to pack */}
                  <div className="space-y-1.5 mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                    {backpack.items.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleBackpackItem(backpack.id, item.id)}
                        className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                          item.isPacked ? 'opacity-60 bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden min-w-0">
                          <span className="shrink-0">{item.emoji}</span>
                          <span className={`truncate min-w-0 ${item.isPacked ? 'line-through' : 'font-medium'}`} style={{ color: themeConfig.textPrimary }}>
                            {item.name}
                          </span>
                          {item.isRequired && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 font-bold uppercase shrink-0">
                              Required
                            </span>
                          )}
                        </div>
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            item.isPacked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {item.isPacked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {displayBackpacks.length === 0 && (
              <div className="p-6 rounded-2xl border text-center text-xs" style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}>
                <p style={{ color: themeConfig.textMuted }}>No backpacks found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
