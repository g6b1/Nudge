import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Plus, CheckSquare, Briefcase, Calendar, Lightbulb } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuickAddModal: React.FC = () => {
  const { 
    isQuickAddOpen, setIsQuickAddOpen, 
    setActiveTab, setIsBrainDumpOpen, themeConfig, 
    saveRoutine, saveChecklist, saveBackpack, saveCalendarEvent, showToast 
  } = useApp();

  const [itemType, setItemType] = useState<'routine' | 'checklist' | 'backpack' | 'task' | 'brainDump'>('task');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✨');

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmed = name.trim();

    if (itemType === 'routine') {
      saveRoutine({
        id: `routine-${Date.now()}`,
        name: trimmed,
        emoji: emoji || '☀️',
        color: '#f59e0b',
        description: 'Created via Quick Add',
        estimatedDuration: 10,
        createdAt: new Date().toISOString(),
        activities: [
          { id: `act-${Date.now()}-1`, name: 'First step', emoji: '🌱', durationMinutes: 5, completed: false, isLowEnergy: true }
        ],
      });
      setActiveTab('routines');
    } else if (itemType === 'checklist') {
      saveChecklist({
        id: `chk-${Date.now()}`,
        name: trimmed,
        emoji: emoji || '📋',
        color: '#10b981',
        createdAt: new Date().toISOString(),
        items: [
          { id: `item-${Date.now()}-1`, title: 'First item', completed: false, emoji: '✓' }
        ],
      });
      setActiveTab('checklists');
    } else if (itemType === 'backpack') {
      saveBackpack({
        id: `bp-${Date.now()}`,
        name: trimmed,
        emoji: emoji || '🎒',
        color: '#6366f1',
        createdAt: new Date().toISOString(),
        items: [
          { id: `bpi-${Date.now()}-1`, name: 'Essential item', emoji: '📦', isRequired: true, isPacked: false }
        ],
      });
      setActiveTab('backpacks');
    } else if (itemType === 'task') {
      const today = new Date().toISOString().split('T')[0];
      saveCalendarEvent({
        id: `evt-${Date.now()}`,
        title: trimmed,
        date: today,
        time: '12:00',
        emoji: emoji || '📌',
        color: themeConfig.accent,
        completed: false,
        type: 'task',
      });
      showToast('Task Scheduled for Today', `Added "${trimmed}" to your agenda.`, emoji);
    } else if (itemType === 'brainDump') {
      setIsBrainDumpOpen(true);
    }

    setIsQuickAddOpen(false);
  };

  const types = [
    { id: 'task', label: 'Task / Reminder', icon: Calendar, emoji: '📌' },
    { id: 'routine', label: 'Routine', icon: Sparkles, emoji: '🔄' },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare, emoji: '📋' },
    { id: 'backpack', label: 'Backpack', icon: Briefcase, emoji: '🎒' },
  ];

  return (
    <div id="quick-add-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
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
            <Plus className="w-5 h-5" style={{ color: themeConfig.accent }} />
            <h2 className="font-bold text-base">Quick Add to Nudge</h2>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: themeConfig.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector Tabs */}
          <div className="grid grid-cols-2 gap-2">
            {types.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setItemType(t.id as any);
                  setEmoji(t.emoji);
                }}
                className={`p-2.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                  itemType === t.id ? 'ring-2 shadow-xs' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: itemType === t.id ? themeConfig.accentSubtle : themeConfig.bgMain,
                  borderColor: itemType === t.id ? themeConfig.accent : themeConfig.border,
                  color: itemType === t.id ? themeConfig.accentText : themeConfig.textSecondary,
                  ringColor: themeConfig.accent,
                }}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>
              Name / Title
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={2}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-12 text-center py-2 rounded-xl border text-base outline-none"
                style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
              />
              <input
                type="text"
                required
                placeholder={`Name of ${itemType}...`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2"
                style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                autoFocus
              />
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-end gap-2" style={{ borderColor: themeConfig.border }}>
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-4 py-2 rounded-xl border text-xs font-semibold"
              style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: themeConfig.accent }}
            >
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
