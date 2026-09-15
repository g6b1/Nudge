import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Copy, Calendar as CalendarIcon, 
  Clock, Check, Sparkles, Trash2, ArrowRight, BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalendarEvent } from '../types';
import { getTodayDateString, formatDateLocal } from '../utils/storage';

export const CalendarView: React.FC = () => {
  const { 
    calendarEvents, saveCalendarEvent, deleteCalendarEvent, toggleCalendarEvent,
    routines, checklists, backpacks, setIsPlanTomorrowOpen, setIsCopyDayOpen,
    journalEntries, openJournalForDate,
    themeConfig, showToast 
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateString());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // New Event Form Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('09:00');
  const [eventEmoji, setEventEmoji] = useState('📌');
  const [eventType, setEventType] = useState<'task' | 'routine' | 'reminder'>('task');

  const todayStr = getTodayDateString();

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
      const sel = new Date(selectedDateStr + 'T00:00:00');
      sel.setDate(sel.getDate() - 7);
      setSelectedDateStr(formatDateLocal(sel));
    } else {
      next.setDate(next.getDate() - 1);
      setSelectedDateStr(formatDateLocal(next));
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
      const sel = new Date(selectedDateStr + 'T00:00:00');
      sel.setDate(sel.getDate() + 7);
      setSelectedDateStr(formatDateLocal(sel));
    } else {
      next.setDate(next.getDate() + 1);
      setSelectedDateStr(formatDateLocal(next));
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(todayStr);
  };

  const handleViewModeChange = (mode: 'month' | 'week' | 'day') => {
    setViewMode(mode);
    if (selectedDateStr) {
      const parts = selectedDateStr.split('-').map(Number);
      if (parts.length === 3) {
        setCurrentDate(new Date(parts[0], parts[1] - 1, parts[2]));
      }
    }
  };

  // Month grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // Week calculations
  const dayOfWeek = currentDate.getDay(); // 0 is Sunday
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - dayOfWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const weekEnd = weekDays[6];
  const weekTitle = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Day calculations
  const dayTitle = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

  const handleSaveNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle.trim(),
      date: selectedDateStr,
      time: eventTime,
      type: eventType,
      emoji: eventEmoji,
      color: themeConfig.accent,
      completed: false,
    };

    saveCalendarEvent(newEvt);
    setIsEventModalOpen(false);
    setEventTitle('');
    showToast('Scheduled', `Added "${newEvt.title}" to ${selectedDateStr}`, newEvt.emoji);
  };

  // Events for the selected date
  const eventsForSelectedDay = calendarEvents.filter(e => e.date === selectedDateStr);

  return (
    <div id="calendar-view" className="space-y-6 pb-12">
      {/* Header with Month / Day nav & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: themeConfig.textPrimary }}>
            Calendar & Schedule
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            Gently organize what matters across days, weeks, and months.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Tomorrow & Copy Day */}
          <button
            type="button"
            onClick={() => setIsPlanTomorrowOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Plan Tomorrow</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCopyDayOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Day</span>
          </button>

          {/* Add Event Button */}
          <button
            id="calendar-add-event-btn"
            type="button"
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: themeConfig.accent }}
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls toolbar */}
      <div 
        className="p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-4 shadow-xs"
        style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-tight" style={{ color: themeConfig.textPrimary }}>
            {viewMode === 'month' ? monthName : viewMode === 'week' ? weekTitle : dayTitle}
          </h2>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
              style={{ color: themeConfig.textSecondary }}
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold hover:bg-black/5"
              style={{ color: themeConfig.accent }}
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
              style={{ color: themeConfig.textSecondary }}
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle: Month, Week, Day */}
        <div className="flex items-center p-1 rounded-2xl border text-xs font-semibold" style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgMain }}>
          {(['month', 'week', 'day'] as const).map(mode => (
            <button
              key={mode}
              id={`calendar-view-${mode}-btn`}
              onClick={() => handleViewModeChange(mode)}
              className={`px-3 py-1 rounded-xl capitalize transition-all cursor-pointer ${
                viewMode === mode ? 'shadow-xs font-bold text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={{
                backgroundColor: viewMode === mode ? themeConfig.accent : 'transparent',
                color: viewMode === mode ? '#ffffff' : themeConfig.textSecondary,
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Calendar Layout: Grid on left/top, Selected Day Detail on right/bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Month / Week / Day Container (spans 2 columns) */}
        <div 
          className="lg:col-span-2 p-3 sm:p-6 rounded-3xl border shadow-xs min-w-0 overflow-hidden"
          style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
        >
          {viewMode === 'month' && (
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] sm:text-xs uppercase mb-3 min-w-0" style={{ color: themeConfig.textMuted }}>
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-0">
                {daysArray.map((dayNum, idx) => {
                  if (dayNum === null) {
                    return <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-2xl opacity-20 min-w-0" />;
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = dateStr === selectedDateStr;
                  const isToday = dateStr === todayStr;

                  // Items for this cell
                  const dayEvents = calendarEvents.filter(e => e.date === dateStr);
                  const dayJournal = journalEntries.find(j => j.date === dateStr);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`h-20 sm:h-24 p-1 sm:p-2 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all min-w-0 overflow-hidden ${
                        isSelected ? 'ring-2' : 'hover:border-stone-400'
                      }`}
                      style={{
                        backgroundColor: isSelected ? themeConfig.accentSubtle : themeConfig.bgMain,
                        borderColor: isToday ? themeConfig.accent : themeConfig.border,
                        ringColor: themeConfig.accent,
                      }}
                    >
                      <div className="flex items-center justify-between min-w-0">
                        <span 
                          className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full shrink-0 ${
                            isToday ? 'bg-amber-500 text-white shadow-xs' : ''
                          }`}
                          style={{ color: isToday ? '#ffffff' : themeConfig.textPrimary }}
                        >
                          {dayNum}
                        </span>

                        <div className="flex items-center gap-1">
                          {dayJournal && (
                            <span 
                              title={`Journal: ${dayJournal.mood?.label || 'Reflected'}`}
                              className="text-[10px] sm:text-xs leading-none shrink-0"
                            >
                              {dayJournal.mood?.emoji || '📖'}
                            </span>
                          )}
                          {dayEvents.length > 0 && (
                            <span className="text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 rounded-full bg-black/10 dark:bg-white/10 shrink-0" style={{ color: themeConfig.textSecondary }}>
                              {dayEvents.length}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Badges / dots in day cell */}
                      <div className="space-y-1 overflow-hidden min-w-0">
                        {dayJournal && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              openJournalForDate(dateStr);
                            }}
                            className="text-[9px] sm:text-[10px] truncate px-1 py-0.5 rounded flex items-center gap-1 opacity-90 min-w-0 font-medium hover:opacity-100 cursor-pointer"
                            style={{ backgroundColor: `${themeConfig.accent}25`, color: themeConfig.textPrimary }}
                            title="Click to view journal reflection"
                          >
                            <span className="shrink-0">{dayJournal.mood?.emoji || '📖'}</span>
                            <span className="truncate min-w-0">{dayJournal.title || 'Journal'}</span>
                          </div>
                        )}
                        {dayEvents.slice(0, dayJournal ? 1 : 2).map(evt => (
                          <div 
                            key={evt.id}
                            className="text-[9px] sm:text-[10px] truncate px-1 rounded flex items-center gap-1 opacity-90 min-w-0"
                            style={{ backgroundColor: `${evt.color || themeConfig.accent}25`, color: themeConfig.textPrimary }}
                          >
                            <span className="shrink-0">{evt.emoji}</span>
                            <span className="truncate min-w-0">{evt.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > (dayJournal ? 1 : 2) && (
                          <span className="text-[8px] sm:text-[9px] block text-right font-medium truncate" style={{ color: themeConfig.textMuted }}>
                            +{dayEvents.length - (dayJournal ? 1 : 2)} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === 'week' && (
            <div className="space-y-3">
              {/* Week days grid */}
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-1.5 sm:gap-2 min-w-0">
                {weekDays.map((d) => {
                  const dateStr = formatDateLocal(d);
                  const isSelected = dateStr === selectedDateStr;
                  const isToday = dateStr === todayStr;
                  const dayEvents = calendarEvents.filter(e => e.date === dateStr);
                  const dayJournal = journalEntries.find(j => j.date === dateStr);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNumber = d.getDate();

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`min-h-[220px] sm:min-h-[280px] p-2 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all min-w-0 overflow-hidden ${
                        isSelected ? 'ring-2' : 'hover:border-stone-400'
                      }`}
                      style={{
                        backgroundColor: isSelected ? themeConfig.accentSubtle : themeConfig.bgMain,
                        borderColor: isToday ? themeConfig.accent : themeConfig.border,
                        ringColor: themeConfig.accent,
                      }}
                    >
                      <div>
                        {/* Day Header */}
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b" style={{ borderColor: themeConfig.border }}>
                          <span className="text-[10px] sm:text-xs font-bold uppercase truncate" style={{ color: themeConfig.textMuted }}>
                            {dayName}
                          </span>
                          <span 
                            className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full shrink-0 ${
                              isToday ? 'bg-amber-500 text-white shadow-xs' : ''
                            }`}
                            style={{ color: isToday ? '#ffffff' : themeConfig.textPrimary }}
                          >
                            {dayNumber}
                          </span>
                        </div>

                        {/* Journal Reflection if present */}
                        {dayJournal && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              openJournalForDate(dateStr);
                            }}
                            className="mb-1.5 text-[9px] sm:text-[10px] truncate p-1 rounded-lg flex items-center gap-1 font-medium cursor-pointer hover:opacity-100"
                            style={{ backgroundColor: `${themeConfig.accent}25`, color: themeConfig.textPrimary }}
                            title="View reflection"
                          >
                            <span className="shrink-0">{dayJournal.mood?.emoji || '📖'}</span>
                            <span className="truncate">{dayJournal.title || 'Reflected'}</span>
                          </div>
                        )}

                        {/* Events list for this day */}
                        <div className="space-y-1.5 overflow-y-auto max-h-[160px] sm:max-h-[180px] pr-0.5">
                          {dayEvents.map(evt => (
                            <div
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCalendarEvent(evt.id);
                              }}
                              className={`p-1.5 rounded-xl border text-[10px] sm:text-[11px] transition-all flex flex-col gap-0.5 cursor-pointer ${
                                evt.completed ? 'opacity-60 line-through' : ''
                              }`}
                              style={{
                                backgroundColor: themeConfig.bgCard,
                                borderColor: themeConfig.border,
                              }}
                              title={`${evt.title} - Click to toggle completion`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs shrink-0">{evt.emoji}</span>
                                <div 
                                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shrink-0 ${
                                    evt.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                                  }`}
                                >
                                  {evt.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                              </div>
                              <span className="font-semibold truncate" style={{ color: themeConfig.textPrimary }}>
                                {evt.title}
                              </span>
                              {evt.time && (
                                <span className="text-[9px] flex items-center gap-0.5" style={{ color: themeConfig.textMuted }}>
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{evt.time}</span>
                                </span>
                              )}
                            </div>
                          ))}

                          {dayEvents.length === 0 && !dayJournal && (
                            <span className="text-[10px] block py-3 text-center italic" style={{ color: themeConfig.textMuted }}>
                              No items
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Add for this day */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateStr(dateStr);
                          setIsEventModalOpen(true);
                        }}
                        className="mt-2 w-full py-1 text-[10px] font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                        style={{ color: themeConfig.accent }}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            <div className="space-y-4">
              {/* Day Header Banner */}
              <div 
                className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: themeConfig.accent }}>
                      Day Schedule
                    </span>
                    {selectedDateStr === todayStr && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold mt-0.5" style={{ color: themeConfig.textPrimary }}>
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto cursor-pointer shrink-0"
                  style={{ backgroundColor: themeConfig.accent }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task / Event</span>
                </button>
              </div>

              {/* Scheduled items list */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeConfig.textSecondary }}>
                    Scheduled Items ({eventsForSelectedDay.length})
                  </h4>
                  <span className="text-xs" style={{ color: themeConfig.textMuted }}>
                    {eventsForSelectedDay.filter(e => e.completed).length} of {eventsForSelectedDay.length} completed
                  </span>
                </div>

                {eventsForSelectedDay.length > 0 ? (
                  <div className="space-y-2">
                    {eventsForSelectedDay.map(evt => (
                      <div
                        key={evt.id}
                        onClick={() => toggleCalendarEvent(evt.id)}
                        className="p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer hover:shadow-xs transition-all"
                        style={{
                          backgroundColor: themeConfig.bgMain,
                          borderColor: themeConfig.border,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{evt.emoji}</span>
                          <div>
                            <p className={`text-sm font-bold ${evt.completed ? 'line-through opacity-60' : ''}`} style={{ color: themeConfig.textPrimary }}>
                              {evt.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {evt.time && (
                                <span className="text-xs flex items-center gap-1" style={{ color: themeConfig.textMuted }}>
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{evt.time}</span>
                                </span>
                              )}
                              <span 
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider capitalize"
                                style={{ backgroundColor: `${evt.color || themeConfig.accent}20`, color: evt.color || themeConfig.accent }}
                              >
                                {evt.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCalendarEvent(evt.id);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                              evt.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {evt.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl border text-xs" style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}>
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: themeConfig.textMuted }} />
                    <p className="font-semibold" style={{ color: themeConfig.textPrimary }}>No events scheduled for this day</p>
                    <p className="mt-1" style={{ color: themeConfig.textMuted }}>Take a breath or schedule a gentle task whenever you are ready.</p>
                    <button
                      type="button"
                      onClick={() => setIsEventModalOpen(true)}
                      className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 inline-flex items-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: themeConfig.accent }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Task</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Daily Reflection Journal Entry for this day */}
              <div className="pt-2 border-t" style={{ borderColor: themeConfig.border }}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: themeConfig.textSecondary }}>
                  Daily Reflection
                </h4>
                {(() => {
                  const dayJournal = journalEntries.find(j => j.date === selectedDateStr);
                  if (dayJournal) {
                    return (
                      <div 
                        onClick={() => openJournalForDate(selectedDateStr)}
                        className="p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer hover:shadow-xs transition-all"
                        style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{dayJournal.mood?.emoji || '📖'}</span>
                          <div>
                            <p className="text-xs font-bold" style={{ color: themeConfig.textPrimary }}>
                              {dayJournal.title || 'Daily Reflection'}
                            </p>
                            <p className="text-[11px] line-clamp-1 mt-0.5" style={{ color: themeConfig.textMuted }}>
                              {dayJournal.content || 'Completed reflection'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold hover:underline" style={{ color: themeConfig.accent }}>
                          Read
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div 
                      className="p-3 rounded-2xl border flex items-center justify-between text-xs"
                      style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
                    >
                      <span style={{ color: themeConfig.textMuted }}>No reflection written yet for this day.</span>
                      <button
                        type="button"
                        onClick={() => openJournalForDate(selectedDateStr)}
                        className="font-semibold hover:underline"
                        style={{ color: themeConfig.accent }}
                      >
                        + Write Reflection
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Recurring Daily Routines */}
              <div className="pt-2 border-t space-y-2" style={{ borderColor: themeConfig.border }}>
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeConfig.textSecondary }}>
                  Daily Routines Available
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {routines.map(r => (
                    <div 
                      key={r.id}
                      className="p-3 rounded-xl border flex items-center justify-between text-xs"
                      style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.emoji}</span>
                        <div>
                          <p className="font-bold" style={{ color: themeConfig.textPrimary }}>{r.name}</p>
                          <p className="text-[10px]" style={{ color: themeConfig.textMuted }}>
                            {r.activities.length} steps • ~{r.estimatedDuration}m
                          </p>
                        </div>
                      </div>
                      <span 
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${r.color || themeConfig.accent}20`, color: r.color || themeConfig.accent }}
                      >
                        {r.activities.filter(a => a.completed).length}/{r.activities.length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Day Agenda Detail */}
        <div 
          className="p-4 sm:p-6 rounded-3xl border shadow-xs flex flex-col justify-between min-w-0 overflow-hidden"
          style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
        >
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: themeConfig.border }}>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: themeConfig.textMuted }}>
                  Selected Date
                </span>
                <h3 className="text-lg font-bold" style={{ color: themeConfig.textPrimary }}>
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsEventModalOpen(true)}
                className="p-2 rounded-xl text-white shadow-xs"
                style={{ backgroundColor: themeConfig.accent }}
                title="Add task to this day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Daily Journal Reflection */}
            {(() => {
              const selectedDateJournal = journalEntries.find(j => j.date === selectedDateStr);
              return (
                <div 
                  className="p-3.5 rounded-2xl border mb-4"
                  style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: themeConfig.textSecondary }}>
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                      <span>Daily Reflection</span>
                    </span>
                    {selectedDateJournal?.mood && (
                      <span className="text-xs px-2 py-0.5 rounded-lg border flex items-center gap-1" style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.accentSubtle, color: themeConfig.accentText }}>
                        <span>{selectedDateJournal.mood.emoji}</span>
                        <span>{selectedDateJournal.mood.label}</span>
                      </span>
                    )}
                  </div>

                  {selectedDateJournal ? (
                    <div className="space-y-1.5">
                      {selectedDateJournal.title && (
                        <h4 className="text-xs font-bold" style={{ color: themeConfig.textPrimary }}>
                          {selectedDateJournal.title}
                        </h4>
                      )}
                      <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: themeConfig.textSecondary }}>
                        {selectedDateJournal.content}
                      </p>
                      <button
                        id="calendar-open-journal-btn"
                        type="button"
                        onClick={() => openJournalForDate(selectedDateStr)}
                        className="text-xs font-semibold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                        style={{ color: themeConfig.accent }}
                      >
                        <span>View or edit reflection</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs py-0.5">
                      <span style={{ color: themeConfig.textMuted }}>No reflection recorded for this day.</span>
                      <button
                        id="calendar-write-journal-btn"
                        type="button"
                        onClick={() => openJournalForDate(selectedDateStr)}
                        className="font-semibold hover:underline cursor-pointer shrink-0 ml-2"
                        style={{ color: themeConfig.accent }}
                      >
                        + Write entry
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Routines & Backpacks Scheduled for this Day */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: themeConfig.textSecondary }}>
                  Scheduled Items ({eventsForSelectedDay.length})
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {eventsForSelectedDay.map(evt => (
                    <div
                      key={evt.id}
                      onClick={() => toggleCalendarEvent(evt.id)}
                      className="p-3 rounded-2xl border flex items-center justify-between cursor-pointer hover:shadow-xs transition-all"
                      style={{
                        backgroundColor: themeConfig.bgMain,
                        borderColor: themeConfig.border,
                      }}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-xl">{evt.emoji}</span>
                        <div>
                          <p className={`text-xs font-bold ${evt.completed ? 'line-through opacity-60' : ''}`} style={{ color: themeConfig.textPrimary }}>
                            {evt.title}
                          </p>
                          {evt.time && (
                            <span className="text-[11px] flex items-center gap-1" style={{ color: themeConfig.textMuted }}>
                              <Clock className="w-3 h-3" />
                              <span>{evt.time}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCalendarEvent(evt.id);
                          }}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            evt.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                          }`}
                        >
                          {evt.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  ))}

                  {eventsForSelectedDay.length === 0 && (
                    <div className="p-6 text-center rounded-2xl border text-xs" style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}>
                      <p style={{ color: themeConfig.textMuted }}>No specific tasks scheduled for this day.</p>
                      <button
                        type="button"
                        onClick={() => setIsEventModalOpen(true)}
                        className="mt-2 text-xs font-semibold hover:underline"
                        style={{ color: themeConfig.accent }}
                      >
                        + Schedule something
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recurring Routine Anchors */}
              <div className="pt-2 border-t" style={{ borderColor: themeConfig.border }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: themeConfig.textSecondary }}>
                  Available Daily Routines
                </p>
                <div className="space-y-1.5">
                  {routines.slice(0, 3).map(r => (
                    <div 
                      key={r.id}
                      className="p-2 rounded-xl flex items-center justify-between text-xs border"
                      style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{r.emoji}</span>
                        <span style={{ color: themeConfig.textPrimary }}>{r.name}</span>
                      </div>
                      <span className="text-[10px]" style={{ color: themeConfig.textMuted }}>
                        ~{r.estimatedDuration}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Quick Action: Copy Day */}
          <div className="pt-4 border-t mt-4" style={{ borderColor: themeConfig.border }}>
            <button
              type="button"
              onClick={() => setIsCopyDayOpen(true)}
              className="w-full py-2.5 px-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy routines & bags from another day</span>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Task Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div 
            className="w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4"
            style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: themeConfig.border }}>
              <h3 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                Schedule Task / Reminder
              </h3>
              <button onClick={() => setIsEventModalOpen(false)} className="p-1 text-stone-400">✕</button>
            </div>

            <form onSubmit={handleSaveNewEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doctor appointment, Pay bill, Grocery run"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                  style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Date</label>
                  <input
                    type="date"
                    value={selectedDateStr}
                    onChange={(e) => setSelectedDateStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Time</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Emoji</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={eventEmoji}
                    onChange={(e) => setEventEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none text-center"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Category</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  >
                    <option value="task">Task</option>
                    <option value="reminder">Reminder</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2" style={{ borderColor: themeConfig.border }}>
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                  style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: themeConfig.accent }}
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
