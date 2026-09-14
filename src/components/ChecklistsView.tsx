import React, { useState } from 'react';
import { 
  Plus, Check, Copy, Archive, Trash2, QrCode, 
  RotateCcw, ChevronDown, ChevronUp, Edit2, ArrowUp, ArrowDown 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Checklist, ChecklistItem } from '../types';

export const ChecklistsView: React.FC = () => {
  const { 
    checklists, saveChecklist, deleteChecklist, duplicateChecklist, 
    archiveChecklist, toggleChecklistItem, resetChecklist, 
    setShareData, themeConfig, searchQuery, setIsQRScannerOpen 
  } = useApp();

  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [expandedChecklistId, setExpandedChecklistId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmoji, setFormEmoji] = useState('📋');
  const [formColor, setFormColor] = useState('#10b981');
  const [formDescription, setFormDescription] = useState('');
  const [formItems, setFormItems] = useState<ChecklistItem[]>([]);
  const [customItemTitle, setCustomItemTitle] = useState('');
  const [customItemEmoji, setCustomItemEmoji] = useState('✓');

  const openCreateModal = () => {
    setEditingChecklist(null);
    setFormName('');
    setFormEmoji('📋');
    setFormColor('#10b981');
    setFormDescription('');
    setFormItems([
      { id: `item-${Date.now()}-1`, title: 'First important step', completed: false, emoji: '✨' },
      { id: `item-${Date.now()}-2`, title: 'Second step', completed: false, emoji: '📌' },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (chk: Checklist) => {
    setEditingChecklist(chk);
    setFormName(chk.name);
    setFormEmoji(chk.emoji);
    setFormColor(chk.color);
    setFormDescription(chk.description || '');
    setFormItems([...chk.items]);
    setIsModalOpen(true);
  };

  const handleSaveChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const checklistToSave: Checklist = {
      id: editingChecklist ? editingChecklist.id : `chk-${Date.now()}`,
      name: formName.trim(),
      emoji: formEmoji || '📋',
      color: formColor,
      description: formDescription.trim(),
      isArchived: editingChecklist ? editingChecklist.isArchived : false,
      createdAt: editingChecklist ? editingChecklist.createdAt : new Date().toISOString(),
      items: formItems,
    };

    saveChecklist(checklistToSave);
    setIsModalOpen(false);
  };

  const addCustomItem = () => {
    if (!customItemTitle.trim()) return;
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: customItemTitle.trim(),
      emoji: customItemEmoji || '✓',
      completed: false,
      color: formColor,
    };
    setFormItems(prev => [...prev, newItem]);
    setCustomItemTitle('');
  };

  const removeFormItem = (index: number) => {
    setFormItems(prev => prev.filter((_, i) => i !== index));
  };

  const moveFormItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= formItems.length) return;
    const updated = [...formItems];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setFormItems(updated);
  };

  const query = searchQuery.toLowerCase().trim();
  const filtered = checklists.filter(c => {
    if (showArchived ? !c.isArchived : c.isArchived) return false;
    if (!query) return true;
    return c.name.toLowerCase().includes(query) || c.items.some(i => i.title.toLowerCase().includes(query));
  });

  return (
    <div id="checklists-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: themeConfig.textPrimary }}>
            Checklists
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            Reusable and task-focused lists for shopping, self-care, cleaning, and more.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
          >
            {showArchived ? 'Show Active' : 'View Archived'}
          </button>

          <button
            id="scan-qr-checklist-btn"
            type="button"
            onClick={() => setIsQRScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
            title="Scan & Import Checklist QR"
          >
            <QrCode className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          <button
            id="create-new-checklist-btn"
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: themeConfig.accent }}
          >
            <Plus className="w-4 h-4" />
            <span>New Checklist</span>
          </button>
        </div>
      </div>

      {/* Grid of Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(checklist => {
          const activeItems = checklist.items.filter(i => !i.completed);
          const completedItems = checklist.items.filter(i => i.completed);
          const isExpanded = expandedChecklistId === checklist.id;

          return (
            <div
              key={checklist.id}
              id={`checklist-card-${checklist.id}`}
              className="rounded-3xl border shadow-xs transition-all overflow-hidden flex flex-col justify-between"
              style={{
                backgroundColor: themeConfig.bgCard,
                borderColor: themeConfig.border,
              }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
                      style={{
                        backgroundColor: `${checklist.color}25`,
                        border: `1.5px solid ${checklist.color}`,
                      }}
                    >
                      {checklist.emoji}
                    </div>
                    <div>
                      <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                        {checklist.name}
                      </h2>
                      <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                        {checklist.description || `${checklist.items.length} items`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShareData({ title: checklist.name, type: 'checklist', data: checklist })}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Share via QR code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateChecklist(checklist.id)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Duplicate checklist"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(checklist)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Edit checklist"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => archiveChecklist(checklist.id)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title={checklist.isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress banner */}
                <div 
                  className="p-3 rounded-2xl flex items-center justify-between text-xs mb-4"
                  style={{ backgroundColor: themeConfig.bgMain }}
                >
                  <span style={{ color: themeConfig.textSecondary }}>
                    {completedItems.length} of {checklist.items.length} completed
                  </span>
                  <button
                    onClick={() => resetChecklist(checklist.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                    title="Reset all checkmarks to reuse list"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset List</span>
                  </button>
                </div>

                {/* Active Items */}
                <div className="space-y-2">
                  {activeItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(checklist.id, item.id)}
                      className="p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer hover:shadow-xs transition-all"
                      style={{
                        backgroundColor: themeConfig.bgCardHover,
                        borderColor: themeConfig.border,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.emoji || '✓'}</span>
                        <span className="text-xs font-medium" style={{ color: themeConfig.textPrimary }}>
                          {item.title}
                        </span>
                      </div>
                      <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all" />
                    </div>
                  ))}

                  {activeItems.length === 0 && checklist.items.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      🎉 All items on this checklist are checked off!
                    </div>
                  )}
                </div>

                {/* Checked Off Category Accordion */}
                {completedItems.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setExpandedChecklistId(isExpanded ? null : checklist.id)}
                      className="w-full flex items-center justify-between text-xs font-medium py-1"
                      style={{ color: themeConfig.textMuted }}
                    >
                      <span>Checked Off ({completedItems.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="space-y-1.5 mt-2">
                        {completedItems.map(item => (
                          <div
                            key={item.id}
                            onClick={() => toggleChecklistItem(checklist.id, item.id)}
                            className="p-2 rounded-xl flex items-center justify-between text-xs opacity-60 bg-black/5 dark:bg-white/5 cursor-pointer line-through"
                          >
                            <div className="flex items-center gap-2">
                              <span>{item.emoji || '✓'}</span>
                              <span>{item.title}</span>
                            </div>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-3xl border" style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}>
            <span className="text-4xl">📋</span>
            <h3 className="font-bold text-base mt-2" style={{ color: themeConfig.textPrimary }}>No checklists found</h3>
            <p className="text-xs max-w-sm mx-auto mt-1 mb-4" style={{ color: themeConfig.textSecondary }}>
              Create grocery lists, packing steps, or cleaning checklists to keep thoughts clear.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: themeConfig.accent }}
            >
              Create Checklist
            </button>
          </div>
        )}
      </div>

      {/* Checklist Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
          <div 
            className="w-full max-w-lg max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden"
            style={{
              backgroundColor: themeConfig.bgCard,
              borderColor: themeConfig.border,
            }}
          >
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeConfig.border }}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{formEmoji}</span>
                <h3 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                  {editingChecklist ? 'Edit Checklist' : 'Create Checklist'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: themeConfig.textSecondary }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveChecklist} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Checklist Name</label>
                <input
                  id="checklist-name-input"
                  type="text"
                  required
                  placeholder="e.g. Grocery List, Deep Clean Bathroom"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2"
                  style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Emoji</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-12 text-center py-1.5 rounded-xl border text-base outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Color</label>
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-12 h-9 p-0 rounded-xl border cursor-pointer"
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Description (optional)</label>
                  <input
                    type="text"
                    placeholder="Short note or reminder..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t" style={{ borderColor: themeConfig.border }}>
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: themeConfig.textSecondary }}>
                  Checklist Items ({formItems.length})
                </label>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {formItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl border flex items-center justify-between text-xs"
                      style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.emoji || '✓'}</span>
                        <span style={{ color: themeConfig.textPrimary }}>{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveFormItem(idx, 'up')}
                          className="p-1 rounded hover:bg-black/5 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === formItems.length - 1}
                          onClick={() => moveFormItem(idx, 'down')}
                          className="p-1 rounded hover:bg-black/5 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFormItem(idx)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item Row */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="New checklist item..."
                    value={customItemTitle}
                    onChange={(e) => setCustomItemTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                  <input
                    type="text"
                    maxLength={2}
                    value={customItemEmoji}
                    onChange={(e) => setCustomItemEmoji(e.target.value)}
                    className="w-10 text-center py-1.5 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  />
                  <button
                    type="button"
                    onClick={addCustomItem}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                    style={{ backgroundColor: themeConfig.accent }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t flex items-center justify-end gap-2" style={{ borderColor: themeConfig.border }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                  style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  id="save-checklist-modal-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: themeConfig.accent }}
                >
                  Save Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
