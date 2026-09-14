import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Copy, ArrowRight, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString, getTomorrowDateString } from '../utils/storage';

export const CopyDayModal: React.FC = () => {
  const { 
    isCopyDayOpen, setIsCopyDayOpen, 
    calendarEvents, saveCalendarEvent, themeConfig, showToast 
  } = useApp();

  const [sourceDate, setSourceDate] = useState(getTodayDateString());
  const [targetDate, setTargetDate] = useState(getTomorrowDateString());

  if (!isCopyDayOpen) return null;

  const handleCopyDay = () => {
    if (sourceDate === targetDate) {
      showToast('Dates are identical', 'Please choose a different target date.', '⚠️');
      return;
    }

    const eventsToCopy = calendarEvents.filter(e => e.date === sourceDate);
    eventsToCopy.forEach(evt => {
      saveCalendarEvent({
        ...evt,
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: targetDate,
        completed: false,
      });
    });

    setIsCopyDayOpen(false);
    showToast('Day Copied', `Transferred ${eventsToCopy.length} events to ${targetDate}.`, '📋');
  };

  return (
    <div id="copy-day-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
          color: themeConfig.textPrimary,
        }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeConfig.border }}>
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5" style={{ color: themeConfig.accent }} />
            <h2 className="font-bold text-base">Copy This Day</h2>
          </div>
          <button
            onClick={() => setIsCopyDayOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: themeConfig.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs leading-relaxed" style={{ color: themeConfig.textSecondary }}>
            Duplicate schedule, routines, and reminders from one date onto another date to save planning time.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: themeConfig.textSecondary }}>
              From Date
            </label>
            <input
              type="date"
              value={sourceDate}
              onChange={(e) => setSourceDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
              style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
            />
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-stone-400 rotate-90 sm:rotate-0" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: themeConfig.textSecondary }}>
              To Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
              style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-end gap-2" style={{ borderColor: themeConfig.border }}>
          <button
            type="button"
            onClick={() => setIsCopyDayOpen(false)}
            className="px-4 py-2 rounded-xl border text-xs font-semibold"
            style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCopyDay}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
            style={{ backgroundColor: themeConfig.accent }}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Schedule</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
