import React from 'react';
import { 
  Sparkles, Plus, Feather, Zap, Lightbulb, 
  Search, Maximize2, LayoutGrid, BookOpen, QrCode
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navigation: React.FC = () => {
  const { 
    activeTab, setActiveTab, 
    themeConfig, isLowEnergy, toggleLowEnergyMode,
    setIsQuickAddOpen, setIsBrainDumpOpen, setIsWidgetsModalOpen,
    setIsTemplateLibraryOpen, setFocusModeItem, searchQuery, setSearchQuery,
    setIsQRScannerOpen
  } = useApp();

  const navItems = [
    { id: 'today', label: 'Today', emoji: '☀️' },
    { id: 'routines', label: 'Routines', emoji: '🔄' },
    { id: 'checklists', label: 'Checklists', emoji: '📋' },
    { id: 'backpacks', label: 'Backpacks', emoji: '🎒' },
    { id: 'calendar', label: 'Calendar', emoji: '📅' },
    { id: 'journal', label: 'Journal', emoji: '📖' },
    { id: 'progress', label: 'Progress', emoji: '📈' },
    { id: 'settings', label: 'Settings', emoji: '⚙️' },
  ];

  return (
    <header 
      id="nudge-navigation-header"
      className="sticky top-0 z-30 border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: `${themeConfig.bgCard}ee`,
        borderColor: themeConfig.border,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Top bar with Logo, Quick actions, and Global tools */}
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3 min-w-0 w-full">
          {/* Brand */}
          <div 
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0 min-w-0"
          >
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-105 shrink-0"
              style={{
                backgroundColor: themeConfig.accentSubtle,
                color: themeConfig.accent,
                border: `1.5px solid ${themeConfig.accent}40`,
              }}
            >
              🌿
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight" style={{ color: themeConfig.textPrimary }}>
                  Nudge
                </span>
                <span 
                  className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0"
                  style={{
                    backgroundColor: themeConfig.accentSubtle,
                    color: themeConfig.accentText,
                  }}
                >
                  Assistant
                </span>
              </div>
              <p className="text-[11px] -mt-0.5 hidden sm:block truncate" style={{ color: themeConfig.textMuted }}>
                Everyday life & self-care in sync
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden lg:flex items-center relative flex-1 max-w-xs min-w-0 mx-2">
            <Search className="w-4 h-4 absolute left-3 pointer-events-none" style={{ color: themeConfig.textMuted }} />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search routines, items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: themeConfig.bgMain,
                borderColor: themeConfig.border,
                color: themeConfig.textPrimary,
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Helper Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink min-w-0 overflow-x-auto py-1 scrollbar-none justify-end">
            {/* Low Energy Mode Toggle */}
            <button
              id="global-low-energy-toggle"
              type="button"
              onClick={toggleLowEnergyMode}
              title="Toggle Low Energy / Quick Mode"
              className={`flex items-center justify-center gap-1.5 min-w-[36px] h-9 px-2.5 sm:px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                isLowEnergy ? 'ring-2 ring-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={{
                borderColor: isLowEnergy ? undefined : themeConfig.border,
                color: isLowEnergy ? undefined : themeConfig.textSecondary,
              }}
            >
              {isLowEnergy ? <Feather className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
              <span className="hidden sm:inline whitespace-nowrap">{isLowEnergy ? 'Low Energy' : 'Full Pace'}</span>
            </button>

            {/* Brain Dump button */}
            <button
              id="global-brain-dump-btn"
              type="button"
              onClick={() => setIsBrainDumpOpen(true)}
              title="Brain Dump: Rapid thoughts & tasks"
              className="flex items-center justify-center gap-1.5 min-w-[36px] h-9 px-2.5 sm:px-3 rounded-xl text-xs font-medium border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shrink-0"
              style={{
                borderColor: themeConfig.border,
                color: themeConfig.textSecondary,
                backgroundColor: themeConfig.bgMain,
              }}
            >
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Brain Dump</span>
            </button>

            {/* Template Library button */}
            <button
              id="global-templates-btn"
              type="button"
              onClick={() => setIsTemplateLibraryOpen(true)}
              title="Template Library"
              className="w-9 h-9 flex items-center justify-center rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shrink-0"
              style={{
                borderColor: themeConfig.border,
                color: themeConfig.textSecondary,
                backgroundColor: themeConfig.bgMain,
              }}
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Focus Mode button */}
            <button
              id="global-focus-mode-btn"
              type="button"
              onClick={() => setFocusModeItem({ title: 'Present Moment Focus', emoji: '🧘', duration: 15, type: 'mindfulness' })}
              title="Focus Mode: Fullscreen distraction-free"
              className="w-9 h-9 flex items-center justify-center rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shrink-0"
              style={{
                borderColor: themeConfig.border,
                color: themeConfig.textSecondary,
                backgroundColor: themeConfig.bgMain,
              }}
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Widgets Preview */}
            <button
              id="global-widgets-btn"
              type="button"
              onClick={() => setIsWidgetsModalOpen(true)}
              title="Home-Screen Widgets"
              className="w-9 h-9 flex items-center justify-center rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shrink-0"
              style={{
                borderColor: themeConfig.border,
                color: themeConfig.textSecondary,
                backgroundColor: themeConfig.bgMain,
              }}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            {/* Scan QR Code Button */}
            <button
              id="global-qr-scanner-btn"
              type="button"
              onClick={() => setIsQRScannerOpen(true)}
              title="Scan & Import Nudge QR Code"
              className="w-9 h-9 flex items-center justify-center rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shrink-0"
              style={{
                borderColor: themeConfig.border,
                color: themeConfig.textSecondary,
                backgroundColor: themeConfig.bgMain,
              }}
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Quick Add Button */}
            <button
              id="global-quick-add-btn"
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center justify-center gap-1.5 min-w-[36px] h-9 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
              style={{ backgroundColor: themeConfig.accent }}
            >
              <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">New</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 -mb-px scrollbar-none w-full max-w-full">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'shadow-xs font-bold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                }`}
                style={{
                  color: isActive ? themeConfig.accentText : themeConfig.textSecondary,
                  backgroundColor: isActive ? themeConfig.accentSubtle : 'transparent',
                }}
              >
                <span className="text-sm">{item.emoji}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span 
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ backgroundColor: themeConfig.accent }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
