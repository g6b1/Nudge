import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, Download, Check, Sparkles, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEMPLATE_LIBRARY, TemplateItem } from '../utils/defaults';

export const TemplateLibraryModal: React.FC = () => {
  const { 
    isTemplateLibraryOpen, setIsTemplateLibraryOpen, 
    importTemplate, themeConfig 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [importedIds, setImportedIds] = useState<string[]>([]);

  if (!isTemplateLibraryOpen) return null;

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'routine', label: 'Routines' },
    { id: 'checklist', label: 'Checklists' },
    { id: 'backpack', label: 'Backpacks' },
  ];

  const filteredTemplates = TEMPLATE_LIBRARY.filter(t => {
    if (selectedCategory === 'all') return true;
    return t.type === selectedCategory;
  });

  const handleImport = (template: TemplateItem) => {
    importTemplate(template);
    setImportedIds(prev => [...prev, template.id]);
  };

  return (
    <div id="template-library-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
          color: themeConfig.textPrimary,
        }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeConfig.border }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base">Template Library</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200">
                  Pre-built & Curated
                </span>
              </div>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                One-tap starter templates for routines, bags, deep cleaning, and ADHD low-friction starts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTemplateLibraryOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: themeConfig.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category filters */}
        <div className="p-3 border-b flex items-center gap-2 overflow-x-auto" style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgMain }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id ? 'bg-white dark:bg-stone-800 shadow-xs ring-1 ring-black/5' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                color: selectedCategory === cat.id ? themeConfig.textPrimary : themeConfig.textSecondary,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map(template => {
            const isImported = importedIds.includes(template.id);

            return (
              <div
                key={template.id}
                className="p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all hover:shadow-sm"
                style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-1 rounded-xl bg-black/5 dark:bg-white/5">{template.emoji}</span>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm" style={{ color: themeConfig.textPrimary }}>
                          {template.name}
                        </h3>
                        <span className="text-[10px] capitalize font-semibold opacity-70">
                          {template.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs mt-2 leading-relaxed" style={{ color: themeConfig.textSecondary }}>
                    {template.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: themeConfig.textMuted }}>
                    {Array.isArray(template.payload) ? `${template.payload.length} items` : 'Complete setup'}
                  </span>

                  <button
                    type="button"
                    disabled={isImported}
                    onClick={() => handleImport(template)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isImported ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'text-white shadow-xs hover:opacity-90 active:scale-95'
                    }`}
                    style={{ backgroundColor: isImported ? undefined : themeConfig.accent }}
                  >
                    {isImported ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isImported ? 'Added to App' : 'Add to Nudge'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
