import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Send, Trash2, Check, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrainDumpItem } from '../types';

export const BrainDumpModal: React.FC = () => {
  const { 
    isBrainDumpOpen, setIsBrainDumpOpen, brainDump, 
    addBrainDumpItem, deleteBrainDumpItem, convertBrainDumpItem,
    themeConfig, showToast 
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [selectedItem, setSelectedItem] = useState<BrainDumpItem | null>(null);
  const [convertType, setConvertType] = useState<'routine' | 'checklist' | 'backpack' | 'event'>('checklist');

  if (!isBrainDumpOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    addBrainDumpItem(inputVal.trim());
    setInputVal('');
  };

  const handleConvert = (item: BrainDumpItem) => {
    convertBrainDumpItem(item.id, convertType);
    setSelectedItem(null);
  };

  return (
    <div id="brain-dump-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
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
            <span className="text-2xl">💡</span>
            <div>
              <h2 className="font-bold text-base">Brain Dump</h2>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Offload thoughts instantly, then organize when you're ready.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBrainDumpOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: themeConfig.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-b flex items-center gap-2" style={{ borderColor: themeConfig.border }}>
          <input
            id="brain-dump-modal-input"
            type="text"
            placeholder="Type anything on your mind..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm border outline-none"
            style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="p-2.5 rounded-xl text-white disabled:opacity-40 transition-all cursor-pointer"
            style={{ backgroundColor: themeConfig.accent }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* List of Captured Thoughts */}
        <div className="flex-1 p-5 overflow-y-auto space-y-2.5">
          {brainDump.map(item => (
            <div
              key={item.id}
              className="p-3 rounded-2xl border flex flex-col gap-2 transition-all hover:shadow-xs"
              style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: themeConfig.textPrimary }}>
                  {item.text}
                </p>
                <button
                  onClick={() => deleteBrainDumpItem(item.id)}
                  className="p-1 text-stone-400 hover:text-red-500 rounded"
                  title="Delete thought"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Conversion Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                <span className="text-[10px] uppercase font-bold" style={{ color: themeConfig.textMuted }}>
                  Send to:
                </span>
                <button
                  onClick={() => convertBrainDumpItem(item.id, 'routine')}
                  className="px-2 py-0.5 rounded-lg border text-[11px] font-medium hover:bg-black/5"
                  style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                >
                  🔄 Routine
                </button>
                <button
                  onClick={() => convertBrainDumpItem(item.id, 'checklist')}
                  className="px-2 py-0.5 rounded-lg border text-[11px] font-medium hover:bg-black/5"
                  style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                >
                  📋 Checklist
                </button>
                <button
                  onClick={() => convertBrainDumpItem(item.id, 'backpack')}
                  className="px-2 py-0.5 rounded-lg border text-[11px] font-medium hover:bg-black/5"
                  style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                >
                  🎒 Backpack
                </button>
                <button
                  onClick={() => convertBrainDumpItem(item.id, 'event')}
                  className="px-2 py-0.5 rounded-lg border text-[11px] font-medium hover:bg-black/5"
                  style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                >
                  📅 Calendar
                </button>
              </div>
            </div>
          ))}

          {brainDump.length === 0 && (
            <div className="py-12 text-center text-xs space-y-2" style={{ color: themeConfig.textMuted }}>
              <span className="text-3xl block">💡</span>
              <p className="font-semibold">Your brain dump is clear!</p>
              <p className="max-w-xs mx-auto">
                Any quick thoughts or errands you drop here can be converted into checklists, routines, or calendar items later.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
