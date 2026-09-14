import React from 'react';
import { 
  Flame, Award, Heart, CheckCircle2, 
  Calendar, RotateCcw, Feather, Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProgressView: React.FC = () => {
  const { 
    streak, resetStreak, routines, checklists, backpacks, completionHistory,
    themeConfig, showToast 
  } = useApp();

  // Compute stats
  const totalRoutines = routines.length;
  let totalActivities = 0;
  let completedActivities = 0;
  routines.forEach(r => {
    r.activities.forEach(a => {
      totalActivities++;
      if (a.completed) completedActivities++;
    });
  });

  const totalChecklists = checklists.length;
  let totalChecklistItems = 0;
  let completedChecklistItems = 0;
  checklists.forEach(c => {
    c.items.forEach(i => {
      totalChecklistItems++;
      if (i.completed) completedChecklistItems++;
    });
  });

  const totalBackpacks = backpacks.length;
  let totalBackpackItems = 0;
  let packedBackpackItems = 0;
  backpacks.forEach(b => {
    b.items.forEach(i => {
      totalBackpackItems++;
      if (i.isPacked) packedBackpackItems++;
    });
  });

  const routineCompletionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
  const checklistCompletionRate = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;
  const backpackPackedRate = totalBackpackItems > 0 ? Math.round((packedBackpackItems / totalBackpackItems) * 100) : 0;

  // Compute strictly accurate 7-day historical activity up to today (no future days, no fake seed data)
  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = dateStr === todayDateStr;

    // Real recorded completions for this date, excluding seed mock IDs
    const validHistoryForDay = (completionHistory || []).filter(
      h => h.date === dateStr && !h.id.startsWith('hist-seed-')
    );

    let score = 0;
    if (isToday) {
      const allItems = totalActivities + totalChecklistItems + totalBackpackItems;
      const allCompleted = completedActivities + completedChecklistItems + packedBackpackItems;
      score = allItems > 0 ? Math.round((allCompleted / allItems) * 100) : (validHistoryForDay.length > 0 ? 100 : 0);
    } else {
      score = validHistoryForDay.length > 0 ? Math.min(100, validHistoryForDay.length * 25) : 0;
    }

    return {
      day: dayLabel,
      date: dateStr,
      score,
      isToday,
      count: isToday ? (completedActivities + completedChecklistItems + packedBackpackItems) : validHistoryForDay.length,
    };
  });

  const hasRealActivity = (streak.currentStreak > 0) || 
    ((streak.longestStreak || streak.bestStreak || 0) > 0) || 
    ((completionHistory || []).some(h => !h.id.startsWith('hist-seed-'))) ||
    completedActivities > 0 || completedChecklistItems > 0 || packedBackpackItems > 0;

  // Milestone Badges based on real achievements
  const badges = [
    {
      id: 'first-step',
      title: 'Gentle Beginning',
      desc: 'Started your self-care journey with Nudge',
      emoji: '🌱',
      earned: hasRealActivity,
    },
    {
      id: 'streak-3',
      title: '3-Day Flow',
      desc: 'Maintained 3 consecutive days of presence',
      emoji: '🌿',
      earned: streak.currentStreak >= 3 || (streak.longestStreak || streak.bestStreak || 0) >= 3,
    },
    {
      id: 'streak-7',
      title: 'Weekly Harmony',
      desc: '7 days of routines and self-support',
      emoji: '🌸',
      earned: streak.currentStreak >= 7 || (streak.longestStreak || streak.bestStreak || 0) >= 7,
    },
    {
      id: 'master-packer',
      title: 'Bag Ready',
      desc: 'Packed 100% of required backpack essentials',
      emoji: '🎒',
      earned: totalBackpackItems > 0 && packedBackpackItems >= totalBackpackItems,
    },
    {
      id: 'grace-healer',
      title: 'Grace & Resilience',
      desc: 'Returned warmly after taking a necessary pause',
      emoji: '🕊️',
      earned: streak.recoveryDaysCount > 0,
    },
    {
      id: 'mindful-starter',
      title: '5-Second Starter',
      desc: 'Overcame task friction with the mental countdown',
      emoji: '🚀',
      earned: hasRealActivity,
    },
  ];

  return (
    <div id="progress-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: themeConfig.textPrimary }}>
            Progress & Gentle Streaks
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            Progress without judgment. Missing a day never ruins your worth.
          </p>
        </div>
      </div>

      {/* Streak Hero Card with Non-Punishing Philosophy */}
      <div 
        className="rounded-3xl p-5 sm:p-8 border shadow-xs relative overflow-hidden min-w-0"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 min-w-0">
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: themeConfig.textMuted }}>
                Gentle Momentum
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: themeConfig.textPrimary }}>
                {streak.currentStreak}
              </span>
              <span className="text-base font-semibold" style={{ color: themeConfig.textSecondary }}>
                days in flow
              </span>
            </div>

            <p className="text-xs sm:text-sm max-w-lg leading-relaxed" style={{ color: themeConfig.textSecondary }}>
              Nudge uses forgiving momentum. If life happens and you need rest, your progress is kept safe with 
              <span className="font-semibold text-emerald-600 dark:text-emerald-400"> Grace & Recovery</span>. Simply return when ready.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-black/5 dark:bg-white/5 font-semibold" style={{ color: themeConfig.textPrimary }}>
                Best Streak: {streak.bestStreak} days
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold">
                Grace Recoveries: {streak.recoveryDaysCount}
              </span>
            </div>
          </div>

          {/* Encouraging Quote / Message */}
          <div 
            className="p-5 rounded-2xl border max-w-sm"
            style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold" style={{ color: themeConfig.textPrimary }}>Assistant Reminder</span>
            </div>
            <p className="text-xs leading-relaxed italic" style={{ color: themeConfig.textSecondary }}>
              "Consistency isn't doing everything perfectly every single day. Consistency is simply having the compassion to return."
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          className="p-5 rounded-3xl border shadow-xs"
          style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl">🔄</span>
            <span className="text-xs font-bold" style={{ color: themeConfig.accent }}>
              {routineCompletionRate}%
            </span>
          </div>
          <h3 className="text-sm font-bold" style={{ color: themeConfig.textPrimary }}>Routines Consistency</h3>
          <p className="text-xs mt-1" style={{ color: themeConfig.textMuted }}>
            {completedActivities} of {totalActivities} activities completed
          </p>
          <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-3">
            <div className="h-full rounded-full" style={{ width: `${routineCompletionRate}%`, backgroundColor: themeConfig.accent }} />
          </div>
        </div>

        <div 
          className="p-5 rounded-3xl border shadow-xs"
          style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl">📋</span>
            <span className="text-xs font-bold text-emerald-500">
              {checklistCompletionRate}%
            </span>
          </div>
          <h3 className="text-sm font-bold" style={{ color: themeConfig.textPrimary }}>Checklist Success</h3>
          <p className="text-xs mt-1" style={{ color: themeConfig.textMuted }}>
            {completedChecklistItems} of {totalChecklistItems} items completed
          </p>
          <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-3">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${checklistCompletionRate}%` }} />
          </div>
        </div>

        <div 
          className="p-5 rounded-3xl border shadow-xs"
          style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl">🎒</span>
            <span className="text-xs font-bold text-indigo-500">
              {backpackPackedRate}%
            </span>
          </div>
          <h3 className="text-sm font-bold" style={{ color: themeConfig.textPrimary }}>Backpack Ready</h3>
          <p className="text-xs mt-1" style={{ color: themeConfig.textMuted }}>
            {packedBackpackItems} of {totalBackpackItems} belongings packed
          </p>
          <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-3">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${backpackPackedRate}%` }} />
          </div>
        </div>
      </div>

      {/* Weekly Activity Summary Bar Chart */}
      <div 
        className="p-6 rounded-3xl border shadow-xs"
        style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
              Weekly Flow Overview
            </h3>
            <p className="text-xs" style={{ color: themeConfig.textMuted }}>
              Daily completion rate across the last 7 days
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: themeConfig.textMuted }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeConfig.accent }} />
            <span>Completion %</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-4 items-end h-44 pt-4 min-w-0 overflow-hidden">
          {last7DaysData.map((dayItem) => {
            const score = dayItem.score;
            return (
              <div key={dayItem.date} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] sm:text-[11px] font-bold" style={{ color: dayItem.isToday ? themeConfig.accent : themeConfig.textSecondary }}>
                  {score}%
                </span>
                <div 
                  className={`w-full max-w-[40px] rounded-2xl h-full max-h-32 flex items-end p-1 transition-all ${
                    dayItem.isToday ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : 'bg-black/5 dark:bg-white/5'
                  }`}
                  title={`${dayItem.date}: ${score}% completed (${dayItem.count} nudges)`}
                >
                  <div 
                    className="w-full rounded-xl transition-all duration-500 min-h-[4px]"
                    style={{ 
                      height: `${Math.max(4, score)}%`, 
                      backgroundColor: dayItem.isToday ? themeConfig.accent : (score > 0 ? `${themeConfig.accent}90` : 'transparent') 
                    }}
                  />
                </div>
                <span 
                  className={`text-[11px] sm:text-xs font-semibold ${dayItem.isToday ? 'font-bold' : ''}`} 
                  style={{ color: dayItem.isToday ? themeConfig.accent : themeConfig.textMuted }}
                >
                  {dayItem.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones & Badges */}
      <div 
        className="p-6 rounded-3xl border shadow-xs"
        style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
              Milestone Celebrations
            </h3>
            <p className="text-xs" style={{ color: themeConfig.textMuted }}>
              Gentle achievements unlocked along your path
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
            {badges.filter(b => b.earned).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                badge.earned ? '' : 'opacity-40 grayscale'
              }`}
              style={{
                backgroundColor: themeConfig.bgMain,
                borderColor: themeConfig.border,
              }}
            >
              <div className="text-3xl p-2 rounded-2xl bg-black/5 dark:bg-white/5">
                {badge.emoji}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs" style={{ color: themeConfig.textPrimary }}>
                    {badge.title}
                  </h4>
                  {badge.earned && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <p className="text-[11px]" style={{ color: themeConfig.textSecondary }}>
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
