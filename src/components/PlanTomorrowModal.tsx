import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTomorrowDateString } from '../utils/storage';

export const PlanTomorrowModal: React.FC = () => {
  const { 
    isPlanTomorrowOpen, setIsPlanTomorrowOpen, 
    routines, backpacks, checklists, saveBackpack, saveCalendarEvent,
    themeConfig, showToast 
  } = useApp();

  const tomorrowStr = getTomorrowDateString();
  const tomorrowFormatted = new Date(tomorrowStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const [selectedBackpackIds, setSelectedBackpackIds] = useState<string[]>(() => 
    backpacks.filter(b => b.packForTomorrow).map(b => b.id)
  );
  const [extraTask, setExtraTask] = useState('');

  if (!isPlanTomorrowOpen) return null;

  const toggleBackpackSelection = (id: string) => {
    setSelectedBackpackIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSavePlan = () => {
    // Update backpack packForTomorrow flags
    backpacks.forEach(b => {
      const shouldPack = selectedBackpackIds.includes(b.id);
      if (b.packForTomorrow !== shouldPack) {
        saveBackpack({ ...b, packForTomorrow: shouldPack });
      }
    });

    if (extraTask.trim()) {
      saveCalendarEvent({
        id: `evt-${Date.now()}`,
        title: extraTask.trim(),
        date: tomorrowStr,
        time: '09:00',
        emoji: '📌',
        color: themeConfig.accent,
        completed: false,
        type: 'task',
      });
    }

    setIsPlanTomorrowOpen(false);
    showToast('Tomorrow is Prepared', `Backpacks and plans set for ${tomorrowFormatted}.`, '🌙');
  };

  return (
    <div id="plan-tomorrow-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
          color: themeConfig.textPrimary,
        }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeConfig.border }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">Plan Tomorrow</h2>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Preparing for {tomorrowFormatted}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPlanTomorrowOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: themeConfig.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          <p className="text-xs leading-relaxed" style={{ color: themeConfig.textSecondary }}>
            Taking 2 minutes the evening before dramatically lowers morning decision fatigue.
            Choose which bags you will need tomorrow:
          </p>

          {/* Backpacks to pack */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: themeConfig.textSecondary }}>
              Bags to Bring Tomorrow
            </label>
            <div className="space-y-2">
              {backpacks.map(bp => {
                const isSelected = selectedBackpackIds.includes(bp.id);
                return (
                  <div
                    key={bp.id}
                    onClick={() => toggleBackpackSelection(bp.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? themeConfig.accentSubtle : themeConfig.bgMain,
                      borderColor: isSelected ? themeConfig.accent : themeConfig.border,
                      ringColor: themeConfig.accent,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{bp.emoji}</span>
                      <div>
                        <h4 className="font-bold text-xs" style={{ color: themeConfig.textPrimary }}>
                          {bp.name}
                        </h4>
                        <p className="text-[10px]" style={{ color: themeConfig.textMuted }}>
                          {bp.items.length} items ({bp.items.filter(i => i.isRequired).length} required)
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extra task for tomorrow */}
          <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: themeConfig.border }}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: themeConfig.textSecondary }}>
              One Important Focus Task for Tomorrow
            </label>
            <input
              type="text"
              placeholder="e.g. Mail parcel, Submit project, Call pharmacy"
              value={extraTask}
              onChange={(e) => setExtraTask(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
              style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-end gap-2" style={{ borderColor: themeConfig.border }}>
          <button
            type="button"
            onClick={() => setIsPlanTomorrowOpen(false)}
            className="px-4 py-2 rounded-xl border text-xs font-semibold"
            style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSavePlan}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
            style={{ backgroundColor: themeConfig.accent }}
          >
            <span>Set Tomorrow's Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
