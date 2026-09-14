import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Plus, Search, Calendar, Trash2, Edit3, 
  Sparkles, Heart, ArrowLeft, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JOURNAL_MOODS } from '../utils/defaults';
import { JournalEntry, JournalMood } from '../types';
import { getTodayDateString, formatDateLocal } from '../utils/storage';

const PROMPTS = [
  "What brought you a moment of peace today?",
  "What is one gentle win you're proud of?",
  "How did your body and mind feel today?",
  "What made you smile or feel grateful?",
  "What is something you want to let go of before tomorrow?",
];

export const JournalView: React.FC = () => {
  const { 
    journalEntries, saveJournalEntry, deleteJournalEntry,
    selectedJournalDate, setSelectedJournalDate,
    themeConfig, setActiveTab, setSelectedDate
  } = useApp();

  const todayStr = getTodayDateString();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  // Active editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState<string>(selectedJournalDate || todayStr);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [entryMood, setEntryMood] = useState<JournalMood | undefined>(undefined);

  // If a selectedJournalDate was passed from Calendar or elsewhere, auto-populate or prompt
  React.useEffect(() => {
    if (selectedJournalDate) {
      setEntryDate(selectedJournalDate);
      const existing = journalEntries.find(e => e.date === selectedJournalDate);
      if (existing) {
        setEditingEntryId(existing.id);
        setEntryTitle(existing.title || '');
        setEntryContent(existing.content);
        setEntryMood(existing.mood);
      } else {
        setEditingEntryId(null);
        setEntryTitle('');
        setEntryContent('');
        setEntryMood(undefined);
      }
      setIsEditing(true);
      // Reset selectedJournalDate in context after consuming
      setSelectedJournalDate(null);
    }
  }, [selectedJournalDate, journalEntries, setSelectedJournalDate]);

  const handleStartNewEntry = (date: string = todayStr) => {
    setEntryDate(date);
    const existing = journalEntries.find(e => e.date === date);
    if (existing) {
      setEditingEntryId(existing.id);
      setEntryTitle(existing.title || '');
      setEntryContent(existing.content);
      setEntryMood(existing.mood);
    } else {
      setEditingEntryId(null);
      setEntryTitle('');
      setEntryContent('');
      setEntryMood(undefined);
    }
    setIsEditing(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEntryDate(entry.date);
    setEntryTitle(entry.title || '');
    setEntryContent(entry.content);
    setEntryMood(entry.mood);
    setIsEditing(true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!entryContent.trim()) return;

    saveJournalEntry({
      id: editingEntryId || undefined,
      date: entryDate,
      title: entryTitle.trim() || undefined,
      content: entryContent.trim(),
      mood: entryMood,
    });

    setIsEditing(false);
    setEditingEntryId(null);
    setEntryTitle('');
    setEntryContent('');
    setEntryMood(undefined);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingEntryId(null);
    setEntryTitle('');
    setEntryContent('');
    setEntryMood(undefined);
  };

  const filteredEntries = useMemo(() => {
    return journalEntries
      .filter(entry => {
        if (selectedMoodFilter !== 'all' && entry.mood?.id !== selectedMoodFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = entry.title?.toLowerCase().includes(q);
          const matchContent = entry.content.toLowerCase().includes(q);
          const matchMood = entry.mood?.label.toLowerCase().includes(q);
          if (!matchTitle && !matchContent && !matchMood) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [journalEntries, selectedMoodFilter, searchQuery]);

  // Check if today already has an entry
  const todayEntry = useMemo(() => {
    return journalEntries.find(e => e.date === todayStr);
  }, [journalEntries, todayStr]);

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dObj = new Date(y, m - 1, d);
      if (dateStr === todayStr) return 'Today, ' + dObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (dateStr === formatDateLocal(yesterday)) {
        return 'Yesterday, ' + dObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }

      return dObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="nudge-journal-view" className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div 
        className="p-6 rounded-3xl border shadow-sm transition-all"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0"
              style={{
                backgroundColor: themeConfig.accentSubtle,
                color: themeConfig.accent,
                border: `1.5px solid ${themeConfig.accent}40`,
              }}
            >
              📖
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: themeConfig.textPrimary }}>
                Daily Journal
              </h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: themeConfig.textSecondary }}>
                A quiet, gentle space to record your thoughts, moods, and reflections.
              </p>
            </div>
          </div>

          {!isEditing && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="journal-new-entry-btn"
                type="button"
                onClick={() => handleStartNewEntry(todayStr)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: themeConfig.accent }}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{todayEntry ? "Edit Today's Entry" : "Write Today's Entry"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Entry Editor Modal / Panel */}
      {isEditing ? (
        <div 
          id="journal-editor-card"
          className="p-6 rounded-3xl border shadow-md space-y-5 transition-all"
          style={{
            backgroundColor: themeConfig.bgCard,
            borderColor: themeConfig.border,
          }}
        >
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: themeConfig.border }}>
            <div className="flex items-center gap-2">
              <button
                id="journal-back-btn"
                type="button"
                onClick={handleCancel}
                className="p-1.5 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                title="Back to Journal"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-bold text-base sm:text-lg" style={{ color: themeConfig.textPrimary }}>
                {editingEntryId ? 'Edit Journal Entry' : 'New Journal Entry'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-xl border flex items-center gap-1.5" style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}>
                <Calendar className="w-3.5 h-3.5" />
                <input
                  id="journal-date-input"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-semibold cursor-pointer"
                  style={{ color: themeConfig.textPrimary }}
                />
              </span>
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: themeConfig.textMuted }}>
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-2">
              {JOURNAL_MOODS.map(m => {
                const isSelected = entryMood?.id === m.id;
                return (
                  <button
                    key={m.id}
                    id={`journal-mood-${m.id}`}
                    type="button"
                    onClick={() => setEntryMood(isSelected ? undefined : m)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected ? 'ring-2 shadow-sm scale-105' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isSelected ? themeConfig.accent : themeConfig.border,
                      backgroundColor: isSelected ? themeConfig.accentSubtle : themeConfig.bgMain,
                      color: isSelected ? themeConfig.accentText : themeConfig.textPrimary,
                    }}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input (Optional) */}
          <div>
            <label htmlFor="journal-title-input" className="block text-xs font-bold mb-1.5" style={{ color: themeConfig.textSecondary }}>
              Title <span className="text-[11px] font-normal opacity-70">(optional)</span>
            </label>
            <input
              id="journal-title-input"
              type="text"
              placeholder="Give your reflection a title or gentle phrase..."
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: themeConfig.bgMain,
                borderColor: themeConfig.border,
                color: themeConfig.textPrimary,
              }}
            />
          </div>

          {/* Writing Prompts Helper */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="text-[11px] font-semibold shrink-0" style={{ color: themeConfig.textMuted }}>
              Gentle prompts:
            </span>
            {PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setEntryContent(prev => prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`);
                }}
                className="text-[11px] px-2.5 py-1 rounded-xl border shrink-0 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left truncate max-w-xs"
                style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Content Textarea (Required) */}
          <div>
            <label htmlFor="journal-content-textarea" className="block text-xs font-bold mb-1.5" style={{ color: themeConfig.textSecondary }}>
              Your Reflection <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="journal-content-textarea"
              rows={8}
              placeholder="Pour your thoughts freely here. There are no rules or expectations..."
              value={entryContent}
              onChange={(e) => setEntryContent(e.target.value)}
              className="w-full p-4 rounded-2xl text-sm leading-relaxed border outline-none transition-all focus:ring-2 resize-y"
              style={{
                backgroundColor: themeConfig.bgMain,
                borderColor: themeConfig.border,
                color: themeConfig.textPrimary,
              }}
            />
          </div>

          {/* Editor Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {editingEntryId && (
                <button
                  id="journal-delete-entry-btn"
                  type="button"
                  onClick={() => {
                    deleteJournalEntry(editingEntryId);
                    handleCancel();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Entry</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="journal-cancel-btn"
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
              >
                Cancel
              </button>
              <button
                id="journal-save-btn"
                type="button"
                onClick={() => handleSave()}
                disabled={!entryContent.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: themeConfig.accent }}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Entry</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* View Entries List & Search */
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div 
            className="p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
            style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
          >
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: themeConfig.textMuted }} />
              <input
                id="journal-search-input"
                type="text"
                placeholder="Search reflections, moods, dates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border outline-none transition-all"
                style={{
                  backgroundColor: themeConfig.bgMain,
                  borderColor: themeConfig.border,
                  color: themeConfig.textPrimary,
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mood filter selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <button
                id="journal-filter-mood-all"
                type="button"
                onClick={() => setSelectedMoodFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap transition-all cursor-pointer ${
                  selectedMoodFilter === 'all' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  borderColor: selectedMoodFilter === 'all' ? themeConfig.accent : themeConfig.border,
                  backgroundColor: selectedMoodFilter === 'all' ? themeConfig.accentSubtle : themeConfig.bgMain,
                  color: selectedMoodFilter === 'all' ? themeConfig.accentText : themeConfig.textSecondary,
                }}
              >
                All Moods
              </button>
              {JOURNAL_MOODS.map(m => (
                <button
                  key={m.id}
                  id={`journal-filter-mood-${m.id}`}
                  type="button"
                  onClick={() => setSelectedMoodFilter(selectedMoodFilter === m.id ? 'all' : m.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border whitespace-nowrap transition-all cursor-pointer ${
                    selectedMoodFilter === m.id ? 'shadow-sm ring-1 ring-emerald-500' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: selectedMoodFilter === m.id ? themeConfig.accent : themeConfig.border,
                    backgroundColor: selectedMoodFilter === m.id ? themeConfig.accentSubtle : themeConfig.bgMain,
                    color: selectedMoodFilter === m.id ? themeConfig.accentText : themeConfig.textSecondary,
                  }}
                >
                  <span>{m.emoji}</span>
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Entries Timeline List */}
          {filteredEntries.length === 0 ? (
            <div 
              className="p-12 text-center rounded-3xl border space-y-3"
              style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
            >
              <div 
                className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-2"
                style={{ backgroundColor: themeConfig.accentSubtle }}
              >
                🌱
              </div>
              <h3 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                {searchQuery || selectedMoodFilter !== 'all' ? 'No reflections matched your search' : 'No journal entries yet'}
              </h3>
              <p className="text-xs max-w-sm mx-auto" style={{ color: themeConfig.textSecondary }}>
                {searchQuery || selectedMoodFilter !== 'all' 
                  ? 'Try clearing your search or selecting all moods to view past entries.' 
                  : 'Your journal is a safe, private space on this device. Start with a single gentle thought or win today.'}
              </p>
              {!searchQuery && selectedMoodFilter === 'all' && (
                <button
                  id="journal-empty-start-btn"
                  type="button"
                  onClick={() => handleStartNewEntry(todayStr)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all cursor-pointer"
                  style={{ backgroundColor: themeConfig.accent }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Write First Reflection</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map(entry => {
                return (
                  <div
                    key={entry.id}
                    id={`journal-entry-${entry.id}`}
                    className="p-5 sm:p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all space-y-3"
                    style={{
                      backgroundColor: themeConfig.bgCard,
                      borderColor: themeConfig.border,
                    }}
                  >
                    {/* Entry Header: Date, Mood, and Controls */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5" style={{ borderColor: themeConfig.border, color: themeConfig.textPrimary, backgroundColor: themeConfig.bgMain }}>
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {formatDateDisplay(entry.date)}
                        </span>
                        {entry.mood && (
                          <span 
                            className="text-xs font-semibold px-2.5 py-1 rounded-xl border flex items-center gap-1.5"
                            style={{ 
                              borderColor: themeConfig.border, 
                              backgroundColor: themeConfig.accentSubtle,
                              color: themeConfig.accentText
                            }}
                          >
                            <span>{entry.mood.emoji}</span>
                            <span>{entry.mood.label}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          id={`journal-calendar-link-${entry.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedDate(entry.date);
                            setActiveTab('calendar');
                          }}
                          title="View on Calendar"
                          className="p-1.5 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs flex items-center gap-1 cursor-pointer"
                          style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Calendar</span>
                        </button>

                        <button
                          id={`journal-edit-entry-${entry.id}`}
                          type="button"
                          onClick={() => handleEditEntry(entry)}
                          title="Edit Entry"
                          className="p-1.5 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                          style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`journal-delete-entry-${entry.id}`}
                          type="button"
                          onClick={() => deleteJournalEntry(entry.id)}
                          title="Delete Entry"
                          className="p-1.5 rounded-xl border hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 transition-all cursor-pointer"
                          style={{ borderColor: themeConfig.border }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Entry Title */}
                    {entry.title && (
                      <h3 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: themeConfig.textPrimary }}>
                        {entry.title}
                      </h3>
                    )}

                    {/* Entry Content */}
                    <div 
                      className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal"
                      style={{ color: themeConfig.textSecondary }}
                    >
                      {entry.content}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
