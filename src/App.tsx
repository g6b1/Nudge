/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { TodayDashboard } from './components/TodayDashboard';
import { RoutinesView } from './components/RoutinesView';
import { ChecklistsView } from './components/ChecklistsView';
import { BackpacksView } from './components/BackpacksView';
import { CalendarView } from './components/CalendarView';
import { JournalView } from './components/JournalView';
import { ProgressView } from './components/ProgressView';
import { SettingsView } from './components/SettingsView';

// Modals & Overlays
import { StartMyDayModal } from './components/StartMyDayModal';
import { MentalCountdownModal } from './components/MentalCountdownModal';
import { GuidedRoutineModal } from './components/GuidedRoutineModal';
import { BrainDumpModal } from './components/BrainDumpModal';
import { ShareModal } from './components/ShareModal';
import { TemplateLibraryModal } from './components/TemplateLibraryModal';
import { FocusModeModal } from './components/FocusModeModal';
import { WidgetsModal } from './components/WidgetsModal';
import { QuickAddModal } from './components/QuickAddModal';
import { PlanTomorrowModal } from './components/PlanTomorrowModal';
import { CopyDayModal } from './components/CopyDayModal';
import { QRScannerModal } from './components/QRScannerModal';
import { ToastContainer } from './components/ToastContainer';

const MainAppLayout: React.FC = () => {
  const { activeTab, themeConfig, settings } = useApp();

  const fontSizeClass = 
    settings.fontSize === 'small' ? 'text-xs' : 
    settings.fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div 
      id="nudge-app-root"
      className={`min-h-screen transition-colors duration-300 ${fontSizeClass} flex flex-col font-sans w-full max-w-full overflow-x-hidden`}
      style={{
        backgroundColor: themeConfig.bgMain,
        color: themeConfig.textPrimary,
      }}
    >
      {/* Navigation Top Bar & Tabs */}
      <Navigation />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 overflow-x-hidden min-w-0">
        {activeTab === 'today' && <TodayDashboard />}
        {activeTab === 'routines' && <RoutinesView />}
        {activeTab === 'checklists' && <ChecklistsView />}
        {activeTab === 'backpacks' && <BackpacksView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'journal' && <JournalView />}
        {activeTab === 'progress' && <ProgressView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating Global Modals */}
      <StartMyDayModal />
      <MentalCountdownModal />
      <GuidedRoutineModal />
      <BrainDumpModal />
      <ShareModal />
      <TemplateLibraryModal />
      <FocusModeModal />
      <WidgetsModal />
      <QuickAddModal />
      <PlanTomorrowModal />
      <CopyDayModal />
      <QRScannerModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
