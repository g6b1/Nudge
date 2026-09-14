import React, { useState } from 'react';
import { 
  Plus, Play, Check, Copy, Archive, Trash2, QrCode, 
  Clock, Edit2, RotateCcw, ChevronDown, ChevronUp, Sparkles, ArrowUp, ArrowDown, Zap, Feather 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Routine, Activity } from '../types';
import { PREPROGRAMMED_ACTIVITIES } from '../utils/defaults';

export const RoutinesView: React.FC = () => {
  const { 
    routines, saveRoutine, deleteRoutine, duplicateRoutine, archiveRoutine,
    toggleActivity, resetRoutineActivities, completeWholeRoutine, setGuidedRoutine,
    launchMentalCountdown, setShareData, themeConfig, isLowEnergy, searchQuery,
    setIsQRScannerOpen
  } = useApp();

  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

  // Form State for create/edit
  const [formName, setFormName] = useState('');
  const [formEmoji, setFormEmoji] = useState('☀️');
  const [formColor, setFormColor] = useState('#f59e0b');
  const [formDescription, setFormDescription] = useState('');
  const [formActivities, setFormActivities] = useState<Activity[]>([]);
  const [formVersionName, setFormVersionName] = useState('Full Version');
  const [formIsMorning, setFormIsMorning] = useState(false);
  const [formLinkedBackpackId, setFormLinkedBackpackId] = useState<string>('');

  // Custom activity adding form inside routine modal
  const [customActName, setCustomActName] = useState('');
  const [customActEmoji, setCustomActEmoji] = useState('✨');
  const [customActDuration, setCustomActDuration] = useState(5);
  const [customActLowEnergy, setCustomActLowEnergy] = useState(true);

  const openCreateModal = () => {
    setEditingRoutine(null);
    setFormName('');
    setFormEmoji('☀️');
    setFormColor('#f59e0b');
    setFormDescription('');
    setFormVersionName('Full Version');
    setFormIsMorning(false);
    setFormLinkedBackpackId('');
    // Seed with 3 default items
    setFormActivities([
      { id: `act-${Date.now()}-1`, name: 'Drink water', emoji: '💧', color: '#0ea5e9', durationMinutes: 1, completed: false, isLowEnergy: true },
      { id: `act-${Date.now()}-2`, name: 'Brush teeth', emoji: '🪥', color: '#38bdf8', durationMinutes: 3, completed: false, isLowEnergy: true },
      { id: `act-${Date.now()}-3`, name: 'Get dressed', emoji: '👕', color: '#f97316', durationMinutes: 5, completed: false, isLowEnergy: true },
    ]);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (routine: Routine) => {
    setEditingRoutine(routine);
    setFormName(routine.name);
    setFormEmoji(routine.emoji);
    setFormColor(routine.color);
    setFormDescription(routine.description);
    setFormVersionName(routine.versionName || 'Full Version');
    setFormIsMorning(routine.isMorningRoutine || false);
    setFormLinkedBackpackId(routine.linkedBackpackId || '');
    setFormActivities([...routine.activities]);
    setIsCreateModalOpen(true);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const totalDuration = formActivities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0);

    const routineToSave: Routine = {
      id: editingRoutine ? editingRoutine.id : `routine-${Date.now()}`,
      name: formName.trim(),
      emoji: formEmoji || '☀️',
      color: formColor,
      description: formDescription.trim(),
      versionName: formVersionName,
      isMorningRoutine: formIsMorning,
      linkedBackpackId: formLinkedBackpackId || undefined,
      isArchived: editingRoutine ? editingRoutine.isArchived : false,
      estimatedDuration: totalDuration,
      createdAt: editingRoutine ? editingRoutine.createdAt : new Date().toISOString(),
      activities: formActivities,
    };

    saveRoutine(routineToSave);
    setIsCreateModalOpen(false);
  };

  // Activity reordering
  const moveActivity = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formActivities.length) return;
    const updated = [...formActivities];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFormActivities(updated);
  };

  const removeActivity = (index: number) => {
    setFormActivities(prev => prev.filter((_, i) => i !== index));
  };

  const addPreprogrammedActivity = (item: typeof PREPROGRAMMED_ACTIVITIES[0]) => {
    const newAct: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      emoji: item.emoji,
      color: item.color,
      durationMinutes: item.durationMinutes,
      completed: false,
      isLowEnergy: item.isLowEnergy,
    };
    setFormActivities(prev => [...prev, newAct]);
  };

  const addCustomActivity = () => {
    if (!customActName.trim()) return;
    const newAct: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: customActName.trim(),
      emoji: customActEmoji || '✨',
      color: formColor,
      durationMinutes: Number(customActDuration) || 2,
      completed: false,
      isLowEnergy: customActLowEnergy,
    };
    setFormActivities(prev => [...prev, newAct]);
    setCustomActName('');
  };

  // Filter routines
  const query = searchQuery.toLowerCase().trim();
  const filtered = routines.filter(r => {
    if (showArchived ? !r.isArchived : r.isArchived) return false;
    if (!query) return true;
    return r.name.toLowerCase().includes(query) || r.activities.some(a => a.name.toLowerCase().includes(query));
  });

  return (
    <div id="routines-view" className="space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: themeConfig.textPrimary }}>
            Routines
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            Sequences of activities you complete with ease and rhythm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-archived-routines-btn"
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
          >
            {showArchived ? 'Show Active' : 'View Archived'}
          </button>

          <button
            id="scan-qr-routine-btn"
            type="button"
            onClick={() => setIsQRScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
            title="Scan & Import Routine QR"
          >
            <QrCode className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          <button
            id="create-new-routine-btn"
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: themeConfig.accent }}
          >
            <Plus className="w-4 h-4" />
            <span>New Routine</span>
          </button>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((routine) => {
          const activeActivities = routine.activities.filter(a => !a.completed);
          const checkedOffActivities = routine.activities.filter(a => a.completed);
          const isExpanded = expandedRoutineId === routine.id;

          return (
            <div
              key={routine.id}
              id={`routine-card-${routine.id}`}
              className="rounded-3xl border shadow-xs transition-all overflow-hidden flex flex-col justify-between"
              style={{
                backgroundColor: themeConfig.bgCard,
                borderColor: themeConfig.border,
              }}
            >
              <div className="p-6">
                {/* Routine Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
                      style={{
                        backgroundColor: `${routine.color}25`,
                        border: `1.5px solid ${routine.color}`,
                      }}
                    >
                      {routine.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                          {routine.name}
                        </h2>
                        {routine.versionName && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-black/5 dark:bg-white/5" style={{ color: themeConfig.textMuted }}>
                            {routine.versionName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                        {routine.description || 'Gentle ordered sequence'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShareData({ title: routine.name, type: 'routine', data: routine })}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Share via QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateRoutine(routine.id)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Duplicate routine"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(routine)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Edit routine"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => archiveRoutine(routine.id)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title={routine.isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Duration & Progress summary */}
                <div 
                  className="p-3 rounded-2xl flex items-center justify-between text-xs mb-4"
                  style={{ backgroundColor: themeConfig.bgMain }}
                >
                  <div className="flex items-center gap-1.5" style={{ color: themeConfig.textSecondary }}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{routine.estimatedDuration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: themeConfig.textPrimary }}>
                      {checkedOffActivities.length}/{routine.activities.length} completed
                    </span>
                    <button
                      onClick={() => resetRoutineActivities(routine.id)}
                      className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Reset routine"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Active Activities list */}
                <div className="space-y-2">
                  {activeActivities.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => toggleActivity(routine.id, act.id)}
                      className="p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer hover:shadow-xs transition-all"
                      style={{
                        backgroundColor: themeConfig.bgCardHover,
                        borderColor: themeConfig.border,
                      }}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-xl">{act.emoji}</span>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: themeConfig.textPrimary }}>
                            {act.name}
                          </p>
                          {act.durationMinutes && (
                            <span className="text-[10px]" style={{ color: themeConfig.textMuted }}>
                              ~{act.durationMinutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all group-hover:border-emerald-500" />
                    </div>
                  ))}

                  {activeActivities.length === 0 && routine.activities.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      🎉 All activities finished for this routine!
                    </div>
                  )}
                </div>

                {/* Checked Off Activities Accordion */}
                {checkedOffActivities.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                      className="w-full flex items-center justify-between text-xs font-medium py-1"
                      style={{ color: themeConfig.textMuted }}
                    >
                      <span>Checked Off ({checkedOffActivities.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="space-y-1.5 mt-2">
                        {checkedOffActivities.map((act) => (
                          <div
                            key={act.id}
                            onClick={() => toggleActivity(routine.id, act.id)}
                            className="p-2 rounded-xl flex items-center justify-between text-xs opacity-60 bg-black/5 dark:bg-white/5 cursor-pointer line-through"
                          >
                            <div className="flex items-center gap-2">
                              <span>{act.emoji}</span>
                              <span>{act.name}</span>
                            </div>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Start Guided Mode Button */}
              <div 
                className="p-4 border-t flex items-center justify-between gap-3"
                style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgCardHover }}
              >
                <button
                  type="button"
                  onClick={() => completeWholeRoutine(routine.id)}
                  className="text-xs font-medium hover:underline"
                  style={{ color: themeConfig.textSecondary }}
                >
                  Mark All Complete
                </button>

                <button
                  id={`guided-btn-${routine.id}`}
                  type="button"
                  onClick={() => {
                    launchMentalCountdown(
                      `Starting ${routine.name}`,
                      () => setGuidedRoutine(routine, isLowEnergy),
                      routine.emoji
                    );
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: routine.color || themeConfig.accent }}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Guided</span>
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-3xl border" style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}>
            <span className="text-4xl">🌱</span>
            <h3 className="font-bold text-base mt-2" style={{ color: themeConfig.textPrimary }}>No routines here yet</h3>
            <p className="text-xs max-w-sm mx-auto mt-1 mb-4" style={{ color: themeConfig.textSecondary }}>
              Create your first morning, night, or work sequence to start gently building rhythm.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: themeConfig.accent }}
            >
              Create Routine
            </button>
          </div>
        )}
      </div>

      {/* Routine Creator & Editor Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
          <div 
            className="w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden"
            style={{
              backgroundColor: themeConfig.bgCard,
              borderColor: themeConfig.border,
            }}
          >
            {/* Modal Header */}
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeConfig.border }}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{formEmoji}</span>
                <h3 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                  {editingRoutine ? 'Edit Routine' : 'Create New Routine'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: themeConfig.textSecondary }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRoutine} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Routine Name</label>
                  <input
                    id="routine-name-input"
                    type="text"
                    required
                    placeholder="e.g. Morning Awakening, Evening Wind Down"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Emoji & Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={2}
                      value={formEmoji}
                      onChange={(e) => setFormEmoji(e.target.value)}
                      className="w-12 text-center py-1.5 rounded-xl border text-base outline-none"
                      style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                    />
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-12 h-9 p-0 rounded-xl border cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Version */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Description</label>
                  <input
                    type="text"
                    placeholder="Gentle purpose or motivation..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Version / Tag</label>
                  <input
                    type="text"
                    placeholder="Full Version, Quick / Low Energy, Weekend"
                    value={formVersionName}
                    onChange={(e) => setFormVersionName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                </div>
              </div>

              {/* Is Morning Routine Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-morning-check"
                  checked={formIsMorning}
                  onChange={(e) => setFormIsMorning(e.target.checked)}
                  className="rounded w-4 h-4 text-amber-500 cursor-pointer"
                />
                <label htmlFor="is-morning-check" className="text-xs font-medium cursor-pointer" style={{ color: themeConfig.textPrimary }}>
                  Set as primary Morning Routine (appears in "Start My Day")
                </label>
              </div>

              {/* Activities Builder */}
              <div className="space-y-3 pt-4 border-t" style={{ borderColor: themeConfig.border }}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider" style={{ color: themeConfig.textSecondary }}>
                    Routine Activities ({formActivities.length})
                  </h4>
                  <span className="text-xs" style={{ color: themeConfig.textMuted }}>
                    Total: ~{formActivities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0)} mins
                  </span>
                </div>

                {/* Ordered activities list */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {formActivities.map((act, index) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-2xl border flex items-center justify-between gap-2 text-xs"
                      style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-base">{act.emoji}</span>
                        <span className="font-medium truncate" style={{ color: themeConfig.textPrimary }}>{act.name}</span>
                        {act.durationMinutes && (
                          <span className="text-[10px]" style={{ color: themeConfig.textMuted }}>~{act.durationMinutes}m</span>
                        )}
                        {act.isLowEnergy && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                            Low Energy
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveActivity(index, 'up')}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === formActivities.length - 1}
                          onClick={() => moveActivity(index, 'down')}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeActivity(index)}
                          className="p-1 rounded hover:bg-red-500/10 text-red-500"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {formActivities.length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: themeConfig.textMuted }}>
                      Add activities from the library below or create custom ones.
                    </p>
                  )}
                </div>

                {/* Preprogrammed Library Quick Add Chips */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold mb-2" style={{ color: themeConfig.textSecondary }}>
                    + Quick Add from Preprogrammed Library:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {PREPROGRAMMED_ACTIVITIES.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addPreprogrammedActivity(item)}
                        className="px-2.5 py-1 rounded-xl border text-[11px] font-medium flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                        style={{ borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                      >
                        <span>{item.emoji}</span>
                        <span>{item.name}</span>
                        <span className="text-[9px] opacity-70">({item.durationMinutes}m)</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom activity input */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Custom activity name..."
                    value={customActName}
                    onChange={(e) => setCustomActName(e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-1.5 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                  <input
                    type="text"
                    maxLength={2}
                    value={customActEmoji}
                    onChange={(e) => setCustomActEmoji(e.target.value)}
                    className="w-10 text-center py-1.5 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={customActDuration}
                    onChange={(e) => setCustomActDuration(Number(e.target.value))}
                    className="w-14 px-2 py-1.5 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                    title="Estimated minutes"
                  />
                  <button
                    type="button"
                    onClick={addCustomActivity}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
                    style={{ backgroundColor: themeConfig.accent }}
                  >
                    + Add Custom
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t flex items-center justify-end gap-2" style={{ borderColor: themeConfig.border }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  id="save-routine-modal-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: themeConfig.accent }}
                >
                  Save Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
