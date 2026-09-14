import React, { useState } from 'react';
import { 
  Plus, Check, Copy, Archive, Trash2, QrCode, 
  AlertTriangle, RotateCcw, Edit2, ArrowUp, ArrowDown, Calendar, Link2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Backpack, BackpackItem } from '../types';
import { PREPROGRAMMED_BACKPACK_ITEMS } from '../utils/defaults';

export const BackpacksView: React.FC = () => {
  const { 
    backpacks, saveBackpack, deleteBackpack, duplicateBackpack, 
    archiveBackpack, toggleBackpackItem, packAllBackpackItems, resetBackpack,
    routines, setShareData, themeConfig, searchQuery, showToast, setIsQRScannerOpen 
  } = useApp();

  const [editingBackpack, setEditingBackpack] = useState<Backpack | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmoji, setFormEmoji] = useState('🎒');
  const [formColor, setFormColor] = useState('#6366f1');
  const [formDescription, setFormDescription] = useState('');
  const [formItems, setFormItems] = useState<BackpackItem[]>([]);
  const [formAssociatedRoutineId, setFormAssociatedRoutineId] = useState('');
  const [formPackForTomorrow, setFormPackForTomorrow] = useState(false);

  // Custom Item inputs
  const [customItemName, setCustomItemName] = useState('');
  const [customItemEmoji, setCustomItemEmoji] = useState('📦');
  const [customItemQuantity, setCustomItemQuantity] = useState(1);
  const [customItemRequired, setCustomItemRequired] = useState(true);

  const openCreateModal = () => {
    setEditingBackpack(null);
    setFormName('');
    setFormEmoji('🎒');
    setFormColor('#6366f1');
    setFormDescription('');
    setFormAssociatedRoutineId('');
    setFormPackForTomorrow(false);
    setFormItems([
      { id: `bp-${Date.now()}-1`, name: 'Keys', emoji: '🔑', color: '#f59e0b', quantity: 1, isRequired: true, isPacked: false },
      { id: `bp-${Date.now()}-2`, name: 'Wallet & ID', emoji: '👛', color: '#eab308', quantity: 1, isRequired: true, isPacked: false },
      { id: `bp-${Date.now()}-3`, name: 'Phone & Charger', emoji: '📱', color: '#38bdf8', quantity: 1, isRequired: true, isPacked: false },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (bp: Backpack) => {
    setEditingBackpack(bp);
    setFormName(bp.name);
    setFormEmoji(bp.emoji);
    setFormColor(bp.color);
    setFormDescription(bp.description || '');
    setFormAssociatedRoutineId(bp.associatedRoutineId || '');
    setFormPackForTomorrow(bp.packForTomorrow || false);
    setFormItems([...bp.items]);
    setIsModalOpen(true);
  };

  const handleSaveBackpack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const backpackToSave: Backpack = {
      id: editingBackpack ? editingBackpack.id : `bp-${Date.now()}`,
      name: formName.trim(),
      emoji: formEmoji || '🎒',
      color: formColor,
      description: formDescription.trim(),
      associatedRoutineId: formAssociatedRoutineId || undefined,
      packForTomorrow: formPackForTomorrow,
      isArchived: editingBackpack ? editingBackpack.isArchived : false,
      lastPackedAt: editingBackpack ? editingBackpack.lastPackedAt : undefined,
      createdAt: editingBackpack ? editingBackpack.createdAt : new Date().toISOString(),
      items: formItems,
    };

    saveBackpack(backpackToSave);
    setIsModalOpen(false);
  };

  const addPreprogrammedItem = (item: typeof PREPROGRAMMED_BACKPACK_ITEMS[0]) => {
    const newItem: BackpackItem = {
      id: `bp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      emoji: item.emoji,
      color: item.color,
      quantity: item.quantity || 1,
      isRequired: item.isRequired,
      isPacked: false,
    };
    setFormItems(prev => [...prev, newItem]);
  };

  const addCustomItem = () => {
    if (!customItemName.trim()) return;
    const newItem: BackpackItem = {
      id: `bp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: customItemName.trim(),
      emoji: customItemEmoji || '📦',
      color: formColor,
      quantity: Number(customItemQuantity) || 1,
      isRequired: customItemRequired,
      isPacked: false,
    };
    setFormItems(prev => [...prev, newItem]);
    setCustomItemName('');
    setCustomItemQuantity(1);
    setCustomItemRequired(true);
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

  const handleTogglePackForTomorrow = (bp: Backpack) => {
    const nextVal = !bp.packForTomorrow;
    saveBackpack({ ...bp, packForTomorrow: nextVal });
    showToast(
      nextVal ? 'Scheduled for Tomorrow' : 'Removed from Tomorrow',
      nextVal ? `"${bp.name}" will be ready to pack tomorrow morning.` : `"${bp.name}" unscheduled.`,
      bp.emoji
    );
  };

  const query = searchQuery.toLowerCase().trim();
  const filtered = backpacks.filter(b => {
    if (showArchived ? !b.isArchived : b.isArchived) return false;
    if (!query) return true;
    return b.name.toLowerCase().includes(query) || b.items.some(i => i.name.toLowerCase().includes(query));
  });

  return (
    <div id="backpacks-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: themeConfig.textPrimary }}>
            Backpacks & Belongings
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            Never forget keys, chargers, medicine, or transit passes again.
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
            id="scan-qr-backpack-btn"
            type="button"
            onClick={() => setIsQRScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
            title="Scan & Import Backpack QR"
          >
            <QrCode className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          <button
            id="create-new-backpack-btn"
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: themeConfig.accent }}
          >
            <Plus className="w-4 h-4" />
            <span>New Backpack</span>
          </button>
        </div>
      </div>

      {/* Grid of Backpacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(bp => {
          const packedItems = bp.items.filter(i => i.isPacked);
          const unpackedItems = bp.items.filter(i => !i.isPacked);
          const missingRequired = bp.items.filter(i => i.isRequired && !i.isPacked);
          const linkedRoutine = routines.find(r => r.id === bp.associatedRoutineId);

          return (
            <div
              key={bp.id}
              id={`backpack-card-${bp.id}`}
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
                        backgroundColor: `${bp.color}25`,
                        border: `1.5px solid ${bp.color}`,
                      }}
                    >
                      {bp.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                          {bp.name}
                        </h2>
                        {bp.packForTomorrow && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>Tomorrow</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                        {bp.description || `${bp.items.length} items`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShareData({ title: bp.name, type: 'backpack', data: bp })}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Share via QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateBackpack(bp.id)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Duplicate bag"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(bp)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Edit bag"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => archiveBackpack(bp.id)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title={bp.isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Missing required items alert */}
                {missingRequired.length > 0 && (
                  <div className="mb-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <div>
                      <span className="font-bold">Missing essential: </span>
                      <span>{missingRequired.map(m => m.name).join(', ')}</span>
                    </div>
                  </div>
                )}

                {/* Linked Routine Note */}
                {linkedRoutine && (
                  <div className="mb-3 flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5" style={{ color: themeConfig.textMuted }}>
                    <Link2 className="w-3 h-3 text-indigo-500" />
                    <span>Opens automatically after completing routine: </span>
                    <span className="font-semibold" style={{ color: themeConfig.textPrimary }}>{linkedRoutine.name}</span>
                  </div>
                )}

                {/* Progress & Quick controls */}
                <div 
                  className="p-3 rounded-2xl flex items-center justify-between text-xs mb-4"
                  style={{ backgroundColor: themeConfig.bgMain }}
                >
                  <div>
                    <span className="font-semibold" style={{ color: themeConfig.textPrimary }}>
                      {packedItems.length}/{bp.items.length} packed
                    </span>
                    {bp.lastPackedAt && (
                      <span className="block text-[10px]" style={{ color: themeConfig.textMuted }}>
                        Last packed {new Date(bp.lastPackedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTogglePackForTomorrow(bp)}
                      className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        bp.packForTomorrow ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200 border-indigo-300' : 'hover:bg-black/5'
                      }`}
                      style={{ borderColor: bp.packForTomorrow ? undefined : themeConfig.border, color: bp.packForTomorrow ? undefined : themeConfig.textSecondary }}
                      title="Add to tomorrow's packing schedule"
                    >
                      Pack Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => resetBackpack(bp.id)}
                      className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: themeConfig.textMuted }}
                      title="Reset pack list"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Unpacked Items */}
                <div className="space-y-2">
                  {unpackedItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleBackpackItem(bp.id, item.id)}
                      className="p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer hover:shadow-xs transition-all"
                      style={{
                        backgroundColor: themeConfig.bgCardHover,
                        borderColor: themeConfig.border,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.emoji}</span>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: themeConfig.textPrimary }}>
                            {item.name}
                            {item.quantity && item.quantity > 1 && (
                              <span className="ml-1 text-[11px] opacity-70">x{item.quantity}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.isRequired && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 font-bold uppercase tracking-wider">
                            Required
                          </span>
                        )}
                        <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all" />
                      </div>
                    </div>
                  ))}

                  {unpackedItems.length === 0 && bp.items.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      🎉 Everything is safely packed in your bag!
                    </div>
                  )}
                </div>

                {/* Packed Items History (Checked off) */}
                {packedItems.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                    <p className="text-xs font-semibold mb-2" style={{ color: themeConfig.textMuted }}>
                      Packed ({packedItems.length})
                    </p>
                    <div className="space-y-1.5">
                      {packedItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => toggleBackpackItem(bp.id, item.id)}
                          className="p-2 rounded-xl flex items-center justify-between text-xs opacity-60 bg-black/5 dark:bg-white/5 cursor-pointer line-through"
                        >
                          <div className="flex items-center gap-2">
                            <span>{item.emoji}</span>
                            <span>{item.name}</span>
                          </div>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Pack All Button */}
              <div 
                className="p-4 border-t flex items-center justify-between gap-3"
                style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgCardHover }}
              >
                <span className="text-xs" style={{ color: themeConfig.textMuted }}>
                  {packedItems.length === bp.items.length ? 'Ready to go!' : 'Check each as you pack'}
                </span>
                <button
                  type="button"
                  onClick={() => packAllBackpackItems(bp.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: bp.color || themeConfig.accent }}
                >
                  Pack All Items
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-3xl border" style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}>
            <span className="text-4xl">🎒</span>
            <h3 className="font-bold text-base mt-2" style={{ color: themeConfig.textPrimary }}>No backpacks yet</h3>
            <p className="text-xs max-w-sm mx-auto mt-1 mb-4" style={{ color: themeConfig.textSecondary }}>
              Create packing templates for work, school, gym, or weekend trips.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: themeConfig.accent }}
            >
              Create Backpack
            </button>
          </div>
        )}
      </div>

      {/* Backpack Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
          <div 
            className="w-full max-w-xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden"
            style={{
              backgroundColor: themeConfig.bgCard,
              borderColor: themeConfig.border,
            }}
          >
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeConfig.border }}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{formEmoji}</span>
                <h3 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                  {editingBackpack ? 'Edit Backpack' : 'Create Backpack'}
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

            <form onSubmit={handleSaveBackpack} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Backpack / Bag Name</label>
                <input
                  id="backpack-name-input"
                  type="text"
                  required
                  placeholder="e.g. Work Backpack, Gym Bag, Overnight Tote"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2"
                  style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>Associate with Routine</label>
                  <select
                    value={formAssociatedRoutineId}
                    onChange={(e) => setFormAssociatedRoutineId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                  >
                    <option value="">None</option>
                    {routines.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.emoji} {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t" style={{ borderColor: themeConfig.border }}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: themeConfig.textSecondary }}>
                    Bag Belongings ({formItems.length})
                  </label>
                  <span className="text-[11px]" style={{ color: themeConfig.textMuted }}>
                    {formItems.filter(i => i.isRequired).length} required
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {formItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl border flex items-center justify-between text-xs"
                      style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.emoji}</span>
                        <span style={{ color: themeConfig.textPrimary }}>{item.name}</span>
                        {item.quantity && item.quantity > 1 && (
                          <span className="text-[10px] opacity-70">x{item.quantity}</span>
                        )}
                        {item.isRequired && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/10 text-amber-600 font-bold uppercase">
                            Required
                          </span>
                        )}
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

                {/* Preprogrammed Item library quick chips */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold mb-1" style={{ color: themeConfig.textSecondary }}>
                    + Quick Add from Essentials Library:
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                    {PREPROGRAMMED_BACKPACK_ITEMS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addPreprogrammedItem(item)}
                        className="px-2 py-0.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 hover:bg-black/5 cursor-pointer"
                        style={{ borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                      >
                        <span>{item.emoji}</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom item row */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Custom item name..."
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
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
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={customItemQuantity}
                    onChange={(e) => setCustomItemQuantity(Number(e.target.value))}
                    className="w-12 px-2 py-1.5 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                    title="Quantity"
                  />
                  <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customItemRequired}
                      onChange={(e) => setCustomItemRequired(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Must have</span>
                  </label>
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
                  id="save-backpack-modal-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: themeConfig.accent }}
                >
                  Save Backpack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
