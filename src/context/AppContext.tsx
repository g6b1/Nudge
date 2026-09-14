import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  UserSettings, Routine, Checklist, Backpack, CalendarEvent,
  BrainDumpItem, CompletionHistoryItem, StreakState, ThemeConfig, Activity, BackpackItem,
  JournalEntry
} from '../types';
import { THEMES } from '../utils/defaults';
import { storage, getTodayDateString, getTomorrowDateString, formatDateLocal } from '../utils/storage';
import { sounds } from '../utils/audio';

interface ShareModalData {
  title: string;
  type: 'routine' | 'checklist' | 'backpack';
  data: Routine | Checklist | Backpack;
}

interface CountdownLaunchPayload {
  title: string;
  emoji?: string;
  durationSeconds?: number;
  onComplete: () => void;
}

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  emoji?: string;
  timestamp: number;
}

interface AppContextType {
  settings: UserSettings;
  themeConfig: ThemeConfig;
  routines: Routine[];
  checklists: Checklist[];
  backpacks: Backpack[];
  calendarEvents: CalendarEvent[];
  brainDump: BrainDumpItem[];
  completionHistory: CompletionHistoryItem[];
  streak: StreakState;
  activeTab: string;
  searchQuery: string;
  isLowEnergy: boolean;
  selectedDate: string; // YYYY-MM-DD for today / calendar inspection

  // Modals & Runners
  isStartMyDayOpen: boolean;
  guidedRoutine: Routine | null;
  guidedRoutineLowEnergy: boolean;
  focusModeItem: { title: string; emoji: string; duration?: number; type?: string } | null;
  countdownData: CountdownLaunchPayload | null;
  isPlanTomorrowOpen: boolean;
  isCopyDayOpen: boolean;
  isQuickAddOpen: boolean;
  isBrainDumpOpen: boolean;
  isTemplateLibraryOpen: boolean;
  isWidgetsModalOpen: boolean;
  isQRScannerOpen: boolean;
  shareData: ShareModalData | null;
  toast: ToastMessage | null;

  // Setters & Triggers
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedDate: (date: string) => void;
  setIsStartMyDayOpen: (open: boolean) => void;
  setGuidedRoutine: (routine: Routine | null, isLowEnergy?: boolean) => void;
  setFocusModeItem: (item: { title: string; emoji: string; duration?: number; type?: string } | null) => void;
  setCountdownData: (data: CountdownLaunchPayload | null) => void;
  setIsPlanTomorrowOpen: (open: boolean) => void;
  setIsCopyDayOpen: (open: boolean) => void;
  setIsQuickAddOpen: (open: boolean) => void;
  setIsBrainDumpOpen: (open: boolean) => void;
  setIsTemplateLibraryOpen: (open: boolean) => void;
  setIsWidgetsModalOpen: (open: boolean) => void;
  setIsQRScannerOpen: (open: boolean) => void;
  setShareData: (data: ShareModalData | null) => void;
  dismissToast: () => void;

  // Core Actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleLowEnergyMode: () => void;
  launchMentalCountdown: (title: string, onComplete: () => void, emoji?: string) => void;
  triggerConfetti: () => void;
  showToast: (title: string, message: string, emoji?: string) => void;
  importSharedItem: (
    jsonStr: string,
    options?: { targetType?: 'routine' | 'checklist' | 'backpack'; mergeIntoId?: string; asNew?: boolean }
  ) => { success: boolean; message: string; type?: string; id?: string };

  // Routines
  saveRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  duplicateRoutine: (id: string) => void;
  archiveRoutine: (id: string) => void;
  toggleActivity: (routineId: string, activityId: string) => void;
  resetRoutineActivities: (routineId: string) => void;
  completeWholeRoutine: (routineId: string) => void;

  // Checklists
  saveChecklist: (checklist: Checklist) => void;
  deleteChecklist: (id: string) => void;
  duplicateChecklist: (id: string) => void;
  archiveChecklist: (id: string) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  resetChecklist: (checklistId: string) => void;

  // Backpacks
  saveBackpack: (backpack: Backpack) => void;
  deleteBackpack: (id: string) => void;
  duplicateBackpack: (id: string) => void;
  archiveBackpack: (id: string) => void;
  toggleBackpackItem: (backpackId: string, itemId: string) => void;
  packAllBackpackItems: (backpackId: string) => void;
  resetBackpack: (backpackId: string) => void;

  // Calendar
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  toggleCalendarEvent: (id: string) => void;
  deleteCalendarEvent: (id: string) => void;

  // Brain Dump
  addBrainDumpItem: (text: string) => void;
  deleteBrainDumpItem: (id: string) => void;
  convertBrainDumpItem: (id: string, target: 'routine_activity' | 'checklist_item' | 'calendar_task', targetContainerId?: string) => void;

  // Journal
  journalEntries: JournalEntry[];
  selectedJournalDate: string | null;
  setSelectedJournalDate: (date: string | null) => void;
  saveJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  deleteJournalEntry: (id: string) => void;
  openJournalForDate: (date: string) => void;

  // Plan Tomorrow & Copy Day
  planTomorrowItems: (routineIds: string[], checklistIds: string[], backpackIds: string[]) => void;
  copyDaySchedule: (sourceDate: string, targetDate: string) => void;

  // Data
  exportBackup: () => void;
  importBackup: (jsonStr: string) => boolean;
  clearAll: () => void;
}

export const computeAccurateStreak = (history: CompletionHistoryItem[]): StreakState => {
  const todayStr = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = formatDateLocal(yesterday);

  if (!history || history.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      recoveryDaysCount: 0,
      totalCompletedRoutines: 0,
      totalCompletedChecklists: 0,
      totalCompletedBackpacks: 0,
    };
  }

  const validHistory = history.filter(h => h && h.date && !h.id.startsWith('hist-seed-'));
  const uniqueDates = Array.from(new Set(validHistory.map(h => h.date))).sort();

  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      recoveryDaysCount: 0,
      totalCompletedRoutines: 0,
      totalCompletedChecklists: 0,
      totalCompletedBackpacks: 0,
    };
  }

  let longestRun = 0;
  let currentRun = 0;
  let recoveries = 0;
  let prevDate: Date | null = null;

  for (const dateStr of uniqueDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);

    if (!prevDate) {
      currentRun = 1;
    } else {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun += 1;
      } else if (diffDays > 1) {
        recoveries += 1;
        currentRun = 1;
      }
    }
    if (currentRun > longestRun) {
      longestRun = currentRun;
    }
    prevDate = currentDate;
  }

  const lastActiveDate = uniqueDates[uniqueDates.length - 1];
  let currentStreak = 0;
  if (lastActiveDate === todayStr || lastActiveDate === yStr) {
    currentStreak = currentRun;
  } else {
    currentStreak = 0;
  }

  const routineCount = validHistory.filter(h => h.type === 'routine').length;
  const checklistCount = validHistory.filter(h => h.type === 'checklist').length;
  const backpackCount = validHistory.filter(h => h.type === 'backpack').length;

  return {
    currentStreak,
    longestStreak: Math.max(longestRun, currentStreak),
    lastActiveDate,
    recoveryDaysCount: recoveries,
    totalCompletedRoutines: routineCount,
    totalCompletedChecklists: checklistCount,
    totalCompletedBackpacks: backpackCount,
  };
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(storage.loadSettings);
  const [routines, setRoutines] = useState<Routine[]>(storage.loadRoutines);
  const [checklists, setChecklists] = useState<Checklist[]>(storage.loadChecklists);
  const [backpacks, setBackpacks] = useState<Backpack[]>(storage.loadBackpacks);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(storage.loadCalendar);
  const [brainDump, setBrainDump] = useState<BrainDumpItem[]>(storage.loadBrainDump);
  const [completionHistory, setCompletionHistory] = useState<CompletionHistoryItem[]>(storage.loadCompletionHistory);
  const [streak, setStreak] = useState<StreakState>(() => computeAccurateStreak(storage.loadCompletionHistory()));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(storage.loadJournalEntries);
  const [selectedJournalDate, setSelectedJournalDate] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Modal / runner states
  const [isStartMyDayOpen, setIsStartMyDayOpen] = useState(false);
  const [guidedRoutine, setGuidedRoutineState] = useState<Routine | null>(null);
  const [guidedRoutineLowEnergy, setGuidedRoutineLowEnergy] = useState(false);
  const [focusModeItem, setFocusModeItem] = useState<{ title: string; emoji: string; duration?: number; type?: string } | null>(null);
  const [countdownData, setCountdownData] = useState<CountdownLaunchPayload | null>(null);
  const [isPlanTomorrowOpen, setIsPlanTomorrowOpen] = useState(false);
  const [isCopyDayOpen, setIsCopyDayOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [isWidgetsModalOpen, setIsWidgetsModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareModalData | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync with storage on state change
  useEffect(() => { storage.saveSettings(settings); }, [settings]);
  useEffect(() => { storage.saveRoutines(routines); }, [routines]);
  useEffect(() => { storage.saveChecklists(checklists); }, [checklists]);
  useEffect(() => { storage.saveBackpacks(backpacks); }, [backpacks]);
  useEffect(() => { storage.saveCalendar(calendarEvents); }, [calendarEvents]);
  useEffect(() => { storage.saveBrainDump(brainDump); }, [brainDump]);
  useEffect(() => { storage.saveCompletionHistory(completionHistory); }, [completionHistory]);
  useEffect(() => { storage.saveStreak(streak); }, [streak]);
  useEffect(() => { storage.saveJournalEntries(journalEntries); }, [journalEntries]);

  const themeConfig = useMemo(() => {
    return THEMES[settings.theme] || THEMES.pastel;
  }, [settings.theme]);

  // Toast handler
  const showToast = useCallback((title: string, message: string, emoji?: string) => {
    const newToast: ToastMessage = {
      id: String(Date.now()),
      title,
      message,
      emoji: emoji || '✨',
      timestamp: Date.now(),
    };
    setToast(newToast);
    if (settings.reminderSound) {
      sounds.playReminder();
    }
  }, [settings.reminderSound]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleLowEnergyMode = useCallback(() => {
    setSettings(prev => {
      const next = !prev.isLowEnergyMode;
      showToast(
        next ? 'Low Energy Mode Active' : 'Standard Routine Mode',
        next ? 'Showing shorter, zero-guilt micro steps today.' : 'Back to regular full routines.',
        next ? '🌱' : '⚡'
      );
      return { ...prev, isLowEnergyMode: next };
    });
  }, [showToast]);

  const triggerConfetti = useCallback(() => {
    if (!settings.completionConfetti) return;
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // ignore
    }
  }, [settings.completionConfetti]);

  // Streak & History recording helper (based purely on real user activity, non-punishing, supportive)
  const recordCompletion = useCallback((itemType: 'routine' | 'checklist' | 'backpack' | 'activity', title: string, emoji: string, durationMinutes?: number) => {
    const today = getTodayDateString();
    const newHistory: CompletionHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: today,
      timestamp: new Date().toISOString(),
      type: itemType,
      title,
      emoji,
      durationMinutes,
    };
    setCompletionHistory(prev => {
      const updated = [newHistory, ...prev];
      setStreak(computeAccurateStreak(updated));
      return updated;
    });
  }, []);

  // Journal Actions
  const saveJournalEntry = useCallback((entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const nowISO = new Date().toISOString();
    setJournalEntries(prev => {
      const existingIdx = entryData.id ? prev.findIndex(e => e.id === entryData.id) : -1;
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...entryData,
          id: entryData.id!,
          updatedAt: nowISO,
        };
        return updated;
      } else {
        const dateIdx = prev.findIndex(e => e.date === entryData.date);
        if (dateIdx >= 0 && !entryData.id) {
          const updated = [...prev];
          updated[dateIdx] = {
            ...updated[dateIdx],
            ...entryData,
            updatedAt: nowISO,
          };
          return updated;
        }

        const newEntry: JournalEntry = {
          id: entryData.id || `journal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          date: entryData.date,
          title: entryData.title?.trim() || undefined,
          content: entryData.content,
          mood: entryData.mood,
          createdAt: nowISO,
          updatedAt: nowISO,
        };
        return [newEntry, ...prev];
      }
    });
    showToast('Journal Entry Saved', 'Your reflection has been safely stored.', '📖');
  }, [showToast]);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
    showToast('Entry Deleted', 'The journal entry was removed.', '🗑️');
  }, [showToast]);

  const openJournalForDate = useCallback((date: string) => {
    setSelectedJournalDate(date);
    setActiveTab('journal');
  }, []);

  // Launch Mental Countdown (5-Second Start)
  const launchMentalCountdown = useCallback((title: string, onComplete: () => void, emoji?: string) => {
    if (settings.countdownDuration === 0) {
      // Instant
      onComplete();
      return;
    }
    setCountdownData({
      title,
      emoji: emoji || '⏱️',
      durationSeconds: settings.countdownDuration,
      onComplete: () => {
        setCountdownData(null);
        onComplete();
      },
    });
  }, [settings.countdownDuration]);

  // Guided Routine setter
  const setGuidedRoutine = useCallback((routine: Routine | null, isLowEnergy: boolean = false) => {
    setGuidedRoutineState(routine);
    setGuidedRoutineLowEnergy(isLowEnergy);
  }, []);

  // Routines CRUD
  const saveRoutine = useCallback((routine: Routine) => {
    setRoutines(prev => {
      const idx = prev.findIndex(r => r.id === routine.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = routine;
        return updated;
      }
      return [routine, ...prev];
    });
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  }, []);

  const duplicateRoutine = useCallback((id: string) => {
    setRoutines(prev => {
      const original = prev.find(r => r.id === id);
      if (!original) return prev;
      const copy: Routine = {
        ...original,
        id: `routine-${Date.now()}`,
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
        activities: original.activities.map(a => ({
          ...a,
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          completed: false,
          completedAt: undefined,
        })),
      };
      return [copy, ...prev];
    });
    showToast('Routine Duplicated', 'A copy of your routine is ready.', '✨');
  }, [showToast]);

  const archiveRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, isArchived: !r.isArchived } : r));
  }, []);

  const toggleActivity = useCallback((routineId: string, activityId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      let targetActName = '';
      let targetEmoji = '';
      let willComplete = false;

      const updatedActs = r.activities.map(a => {
        if (a.id === activityId) {
          willComplete = !a.completed;
          targetActName = a.name;
          targetEmoji = a.emoji;
          return {
            ...a,
            completed: willComplete,
            completedAt: willComplete ? new Date().toISOString() : undefined,
          };
        }
        return a;
      });

      if (willComplete) {
        if (settings.soundsEnabled) sounds.playCheck();
        if (settings.vibrationEnabled) sounds.vibrate(35);
        recordCompletion('activity', `${r.name}: ${targetActName}`, targetEmoji);
      }

      // Check if all activities are completed
      const allDone = updatedActs.every(a => a.completed);
      if (allDone && willComplete) {
        if (settings.soundsEnabled) sounds.playRoutineComplete();
        triggerConfetti();
        recordCompletion('routine', r.name, r.emoji, r.estimatedDuration);
        showToast('Routine Completed!', `You finished all activities in "${r.name}".`, '🎉');

        // Check if there is an associated backpack or dependent checklist
        if (r.linkedBackpackId) {
          const bp = backpacks.find(b => b.id === r.linkedBackpackId);
          if (bp) {
            setTimeout(() => {
              showToast('Backpack Ready', `Opening "${bp.name}" so you don't forget anything!`, bp.emoji);
              setActiveTab('backpacks');
            }, 1200);
          }
        }
      }

      return { ...r, activities: updatedActs };
    }));
  }, [settings.soundsEnabled, settings.vibrationEnabled, recordCompletion, triggerConfetti, showToast, backpacks]);

  const resetRoutineActivities = useCallback((routineId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      return {
        ...r,
        activities: r.activities.map(a => ({ ...a, completed: false, completedAt: undefined })),
      };
    }));
    showToast('Routine Reset', 'Activities are fresh and ready to start.', '🔄');
  }, [showToast]);

  const completeWholeRoutine = useCallback((routineId: string) => {
    const r = routines.find(item => item.id === routineId);
    if (!r) return;
    setRoutines(prev => prev.map(item => {
      if (item.id !== routineId) return item;
      return {
        ...item,
        activities: item.activities.map(a => ({ ...a, completed: true, completedAt: new Date().toISOString() })),
      };
    }));
    if (settings.soundsEnabled) sounds.playRoutineComplete();
    if (settings.vibrationEnabled) sounds.vibrate([40, 60, 80]);
    triggerConfetti();
    recordCompletion('routine', r.name, r.emoji, r.estimatedDuration);
    showToast('Routine Finished!', `Wonderful job completing "${r.name}"!`, '🎉');

    if (r.linkedBackpackId) {
      const bp = backpacks.find(b => b.id === r.linkedBackpackId);
      if (bp) {
        setTimeout(() => {
          showToast('Pack Your Bag', `Opening "${bp.name}" next.`, bp.emoji);
          setActiveTab('backpacks');
        }, 1200);
      }
    }
  }, [routines, settings.soundsEnabled, settings.vibrationEnabled, triggerConfetti, recordCompletion, showToast, backpacks]);

  // Checklists CRUD
  const saveChecklist = useCallback((checklist: Checklist) => {
    setChecklists(prev => {
      const idx = prev.findIndex(c => c.id === checklist.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = checklist;
        return updated;
      }
      return [checklist, ...prev];
    });
  }, []);

  const deleteChecklist = useCallback((id: string) => {
    setChecklists(prev => prev.filter(c => c.id !== id));
  }, []);

  const duplicateChecklist = useCallback((id: string) => {
    setChecklists(prev => {
      const original = prev.find(c => c.id === id);
      if (!original) return prev;
      const copy: Checklist = {
        ...original,
        id: `chk-${Date.now()}`,
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
        items: original.items.map(it => ({
          ...it,
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          completed: false,
          completedAt: undefined,
        })),
      };
      return [copy, ...prev];
    });
    showToast('Checklist Duplicated', 'New copy added to your checklists.', '📋');
  }, [showToast]);

  const archiveChecklist = useCallback((id: string) => {
    setChecklists(prev => prev.map(c => c.id === id ? { ...c, isArchived: !c.isArchived } : c));
  }, []);

  const toggleChecklistItem = useCallback((checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(c => {
      if (c.id !== checklistId) return c;
      let willComplete = false;
      let itemName = '';
      let itemEmoji = '✓';

      const updatedItems = c.items.map(it => {
        if (it.id === itemId) {
          willComplete = !it.completed;
          itemName = it.title;
          itemEmoji = it.emoji || c.emoji;
          return {
            ...it,
            completed: willComplete,
            completedAt: willComplete ? new Date().toISOString() : undefined,
          };
        }
        return it;
      });

      if (willComplete) {
        if (settings.soundsEnabled) sounds.playCheck();
        if (settings.vibrationEnabled) sounds.vibrate(30);
        recordCompletion('checklist', `${c.name}: ${itemName}`, itemEmoji);
      }

      const allDone = updatedItems.every(i => i.completed);
      if (allDone && willComplete) {
        if (settings.soundsEnabled) sounds.playRoutineComplete();
        triggerConfetti();
        recordCompletion('checklist', c.name, c.emoji);
        showToast('Checklist Completed!', `All items in "${c.name}" checked off!`, '🎉');
      }

      return { ...c, items: updatedItems };
    }));
  }, [settings.soundsEnabled, settings.vibrationEnabled, recordCompletion, triggerConfetti, showToast]);

  const resetChecklist = useCallback((checklistId: string) => {
    setChecklists(prev => prev.map(c => {
      if (c.id !== checklistId) return c;
      return {
        ...c,
        items: c.items.map(it => ({ ...it, completed: false, completedAt: undefined })),
      };
    }));
    showToast('Checklist Reset', 'Items are ready to be reused.', '🔄');
  }, [showToast]);

  // Backpacks CRUD
  const saveBackpack = useCallback((backpack: Backpack) => {
    setBackpacks(prev => {
      const idx = prev.findIndex(b => b.id === backpack.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = backpack;
        return updated;
      }
      return [backpack, ...prev];
    });
  }, []);

  const deleteBackpack = useCallback((id: string) => {
    setBackpacks(prev => prev.filter(b => b.id !== id));
  }, []);

  const duplicateBackpack = useCallback((id: string) => {
    setBackpacks(prev => {
      const original = prev.find(b => b.id === id);
      if (!original) return prev;
      const copy: Backpack = {
        ...original,
        id: `bp-${Date.now()}`,
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
        items: original.items.map(it => ({
          ...it,
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          isPacked: false,
          packedAt: undefined,
        })),
      };
      return [copy, ...prev];
    });
    showToast('Backpack Duplicated', 'Bag duplicated successfully.', '🎒');
  }, [showToast]);

  const archiveBackpack = useCallback((id: string) => {
    setBackpacks(prev => prev.map(b => b.id === id ? { ...b, isArchived: !b.isArchived } : b));
  }, []);

  const toggleBackpackItem = useCallback((backpackId: string, itemId: string) => {
    setBackpacks(prev => prev.map(b => {
      if (b.id !== backpackId) return b;
      let willPack = false;
      let itemName = '';
      let itemEmoji = '🎒';

      const updatedItems = b.items.map(it => {
        if (it.id === itemId) {
          willPack = !it.isPacked;
          itemName = it.name;
          itemEmoji = it.emoji;
          return {
            ...it,
            isPacked: willPack,
            packedAt: willPack ? new Date().toISOString() : undefined,
          };
        }
        return it;
      });

      if (willPack) {
        if (settings.soundsEnabled) sounds.playCheck();
        if (settings.vibrationEnabled) sounds.vibrate(30);
      }

      const allPacked = updatedItems.every(it => it.isPacked);
      if (allPacked && willPack) {
        if (settings.soundsEnabled) sounds.playRoutineComplete();
        triggerConfetti();
        recordCompletion('backpack', b.name, b.emoji);
        showToast('Fully Packed!', `All items for "${b.name}" are packed and ready!`, '🎒');
      }

      return {
        ...b,
        items: updatedItems,
        lastPackedAt: allPacked ? new Date().toISOString() : b.lastPackedAt,
      };
    }));
  }, [settings.soundsEnabled, settings.vibrationEnabled, recordCompletion, triggerConfetti, showToast]);

  const packAllBackpackItems = useCallback((backpackId: string) => {
    const b = backpacks.find(item => item.id === backpackId);
    if (!b) return;
    setBackpacks(prev => prev.map(bp => {
      if (bp.id !== backpackId) return bp;
      return {
        ...bp,
        lastPackedAt: new Date().toISOString(),
        items: bp.items.map(it => ({ ...it, isPacked: true, packedAt: new Date().toISOString() })),
      };
    }));
    if (settings.soundsEnabled) sounds.playRoutineComplete();
    triggerConfetti();
    recordCompletion('backpack', b.name, b.emoji);
    showToast('Bag Packed!', `"${b.name}" is completely packed. Safe travels!`, '🎒');
  }, [backpacks, settings.soundsEnabled, triggerConfetti, recordCompletion, showToast]);

  const resetBackpack = useCallback((backpackId: string) => {
    setBackpacks(prev => prev.map(b => {
      if (b.id !== backpackId) return b;
      return {
        ...b,
        items: b.items.map(it => ({ ...it, isPacked: false, packedAt: undefined })),
      };
    }));
    showToast('Backpack Reset', 'Ready to pack again.', '🎒');
  }, [showToast]);

  // Calendar
  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };
    setCalendarEvents(prev => [...prev, newEvent]);
    showToast('Scheduled', `"${event.title}" added to your calendar.`, '📅');
  }, [showToast]);

  const toggleCalendarEvent = useCallback((id: string) => {
    setCalendarEvents(prev => prev.map(ev => {
      if (ev.id !== id) return ev;
      const nextDone = !ev.completed;
      if (nextDone) {
        if (settings.soundsEnabled) sounds.playCheck();
        recordCompletion('activity', ev.title, ev.emoji);
      }
      return {
        ...ev,
        completed: nextDone,
        completedAt: nextDone ? new Date().toISOString() : undefined,
      };
    }));
  }, [settings.soundsEnabled, recordCompletion]);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents(prev => prev.filter(ev => ev.id !== id));
  }, []);

  // Brain Dump
  const addBrainDumpItem = useCallback((text: string) => {
    if (!text.trim()) return;
    const newItem: BrainDumpItem = {
      id: `bd-${Date.now()}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setBrainDump(prev => [newItem, ...prev]);
    showToast('Thought Saved', 'Captured in your Brain Dump for later.', '💡');
  }, [showToast]);

  const deleteBrainDumpItem = useCallback((id: string) => {
    setBrainDump(prev => prev.filter(item => item.id !== id));
  }, []);

  const convertBrainDumpItem = useCallback((id: string, target: 'routine_activity' | 'checklist_item' | 'calendar_task', targetContainerId?: string) => {
    const item = brainDump.find(it => it.id === id);
    if (!item) return;

    if (target === 'routine_activity') {
      const routineId = targetContainerId || routines[0]?.id;
      if (routineId) {
        setRoutines(prev => prev.map(r => {
          if (r.id !== routineId) return r;
          const newAct: Activity = {
            id: `act-${Date.now()}`,
            name: item.text,
            emoji: '✨',
            color: '#f59e0b',
            durationMinutes: 5,
            completed: false,
            isLowEnergy: true,
          };
          return { ...r, activities: [...r.activities, newAct] };
        }));
        showToast('Converted to Routine', `Added to routine activities!`, '☀️');
      }
    } else if (target === 'checklist_item') {
      const chkId = targetContainerId || checklists[0]?.id;
      if (chkId) {
        setChecklists(prev => prev.map(c => {
          if (c.id !== chkId) return c;
          return {
            ...c,
            items: [
              ...c.items,
              {
                id: `item-${Date.now()}`,
                title: item.text,
                completed: false,
                emoji: '✓',
                color: c.color,
              },
            ],
          };
        }));
        showToast('Converted to Checklist', `Added to checklist!`, '📋');
      }
    } else if (target === 'calendar_task') {
      addCalendarEvent({
        title: item.text,
        emoji: '📌',
        color: '#38bdf8',
        date: getTodayDateString(),
        type: 'task',
        completed: false,
      });
    }

    // Remove from brain dump
    setBrainDump(prev => prev.filter(it => it.id !== id));
  }, [brainDump, routines, checklists, addCalendarEvent, showToast]);

  // Plan Tomorrow
  const planTomorrowItems = useCallback((routineIds: string[], checklistIds: string[], backpackIds: string[]) => {
    const tomorrow = getTomorrowDateString();
    const newEvents: CalendarEvent[] = [];

    routineIds.forEach(id => {
      const r = routines.find(it => it.id === id);
      if (r) {
        newEvents.push({
          id: `cal-tom-${Date.now()}-${r.id}`,
          title: r.name,
          emoji: r.emoji,
          color: r.color,
          date: tomorrow,
          time: r.recurring?.time || '08:00',
          type: 'routine',
          targetId: r.id,
          completed: false,
        });
      }
    });

    checklistIds.forEach(id => {
      const c = checklists.find(it => it.id === id);
      if (c) {
        newEvents.push({
          id: `cal-tom-${Date.now()}-${c.id}`,
          title: c.name,
          emoji: c.emoji,
          color: c.color,
          date: tomorrow,
          type: 'checklist',
          targetId: c.id,
          completed: false,
        });
      }
    });

    backpackIds.forEach(id => {
      const b = backpacks.find(it => it.id === id);
      if (b) {
        newEvents.push({
          id: `cal-tom-${Date.now()}-${b.id}`,
          title: b.name,
          emoji: b.emoji,
          color: b.color,
          date: tomorrow,
          type: 'backpack',
          targetId: b.id,
          completed: false,
        });
      }
    });

    if (newEvents.length > 0) {
      setCalendarEvents(prev => [...prev, ...newEvents]);
      showToast('Tomorrow Planned!', `Scheduled ${newEvents.length} items for tomorrow.`, '🌟');
    }
  }, [routines, checklists, backpacks, showToast]);

  // Copy Day Schedule
  const copyDaySchedule = useCallback((sourceDate: string, targetDate: string) => {
    const sourceEvents = calendarEvents.filter(ev => ev.date === sourceDate);
    if (sourceEvents.length === 0) {
      showToast('No Items to Copy', `No scheduled items found on ${sourceDate}.`, 'ℹ️');
      return;
    }

    const copiedEvents: CalendarEvent[] = sourceEvents.map(ev => ({
      ...ev,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: targetDate,
      completed: false,
      completedAt: undefined,
    }));

    setCalendarEvents(prev => [...prev, ...copiedEvents]);
    showToast('Schedule Copied', `Copied ${copiedEvents.length} items to ${targetDate}.`, '📋');
  }, [calendarEvents, showToast]);

  // Data handlers
  const exportBackup = useCallback(() => {
    storage.exportAllData();
    showToast('Backup Downloaded', 'All your Nudge data was safely exported.', '💾');
  }, [showToast]);

  const importBackup = useCallback((jsonStr: string): boolean => {
    const ok = storage.importAllData(jsonStr);
    if (ok) {
      setSettings(storage.loadSettings());
      setRoutines(storage.loadRoutines());
      setChecklists(storage.loadChecklists());
      setBackpacks(storage.loadBackpacks());
      setCalendarEvents(storage.loadCalendar());
      setBrainDump(storage.loadBrainDump());
      setCompletionHistory(storage.loadCompletionHistory());
      setStreak(storage.loadStreak());
      showToast('Backup Restored', 'All settings and routines have been loaded!', '🎉');
      return true;
    } else {
      showToast('Import Failed', 'Invalid JSON file format. Please check file.', '⚠️');
      return false;
    }
  }, [showToast]);

  const importSharedItem = useCallback((
    jsonStr: string,
    options?: { targetType?: 'routine' | 'checklist' | 'backpack'; mergeIntoId?: string; asNew?: boolean }
  ): { success: boolean; message: string; type?: string; id?: string } => {
    try {
      let raw: any;
      try {
        raw = JSON.parse(jsonStr.trim());
      } catch {
        return { success: false, message: 'Invalid QR code or JSON data. Could not decode content.' };
      }

      // Handle Nudge envelope format or direct payload
      let type: 'routine' | 'checklist' | 'backpack' = 'routine';
      let payload: any = null;

      if (raw && typeof raw === 'object') {
        if (raw.nudgeVersion && raw.payload) {
          type = raw.type || 'routine';
          payload = raw.payload;
        } else if (raw.type && (raw.payload || raw.data)) {
          type = raw.type;
          payload = raw.payload || raw.data;
        } else if (Array.isArray(raw.activities)) {
          type = 'routine';
          payload = raw;
        } else if (Array.isArray(raw.items)) {
          const first = raw.items[0];
          if (first && (first.isPacked !== undefined || first.isRequired !== undefined)) {
            type = 'backpack';
          } else {
            type = 'checklist';
          }
          payload = raw;
        } else {
          return { success: false, message: 'Unrecognized content. QR code does not contain a Nudge routine, checklist, or backpack.' };
        }
      } else {
        return { success: false, message: 'Invalid data format inside QR code.' };
      }

      if (!payload || typeof payload !== 'object') {
        return { success: false, message: 'Empty or invalid item payload in QR code.' };
      }

      const finalType = options?.targetType || type;
      const mergeIntoId = options?.mergeIntoId;
      const itemName = payload.name || payload.title || `Shared ${finalType.charAt(0).toUpperCase() + finalType.slice(1)}`;

      // Check if user chose to merge into an existing item
      if (mergeIntoId) {
        if (finalType === 'routine') {
          const target = routines.find(r => r.id === mergeIntoId);
          if (!target) return { success: false, message: 'Selected target routine could not be found.' };
          const rawActivities = payload.activities || (payload.items ? payload.items.map((i: any) => ({
            name: i.name,
            emoji: i.emoji || '✨',
            color: payload.color || '#f59e0b',
            durationMinutes: 5,
            completed: false,
            isLowEnergy: true,
          })) : []);

          const newActs: Activity[] = rawActivities.map((a: any, idx: number) => ({
            id: `act-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            name: a.name || 'Activity',
            emoji: a.emoji || '✨',
            color: a.color || target.color || '#f59e0b',
            durationMinutes: Number(a.durationMinutes) || 5,
            completed: false,
            isLowEnergy: a.isLowEnergy ?? true,
          }));

          setRoutines(prev => prev.map(r => r.id === mergeIntoId ? {
            ...r,
            activities: [...r.activities, ...newActs],
            estimatedDuration: r.estimatedDuration + newActs.reduce((sum, a) => sum + a.durationMinutes, 0),
          } : r));

          triggerConfetti();
          showToast('Added to Routine', `Added ${newActs.length} activities to "${target.name}".`, '✨');
          return { success: true, message: `Added ${newActs.length} activities to "${target.name}".`, type: 'routine', id: target.id };
        } else if (finalType === 'checklist') {
          const target = checklists.find(c => c.id === mergeIntoId);
          if (!target) return { success: false, message: 'Selected target checklist could not be found.' };
          const rawItems = payload.items || (payload.activities ? payload.activities.map((a: any) => ({
            name: a.name,
            emoji: a.emoji || '✓',
            completed: false,
          })) : []);

          const newItems = rawItems.map((it: any, idx: number) => ({
            id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            name: it.name || 'Task item',
            emoji: it.emoji || '✓',
            completed: false,
          }));

          setChecklists(prev => prev.map(c => c.id === mergeIntoId ? {
            ...c,
            items: [...c.items, ...newItems],
          } : c));

          triggerConfetti();
          showToast('Added to Checklist', `Added ${newItems.length} items to "${target.name}".`, '📋');
          return { success: true, message: `Added ${newItems.length} items to "${target.name}".`, type: 'checklist', id: target.id };
        } else if (finalType === 'backpack') {
          const target = backpacks.find(b => b.id === mergeIntoId);
          if (!target) return { success: false, message: 'Selected target backpack could not be found.' };
          const rawItems = payload.items || (payload.activities ? payload.activities.map((a: any) => ({
            name: a.name,
            emoji: a.emoji || '🎒',
            isRequired: false,
            isPacked: false,
          })) : []);

          const newItems: BackpackItem[] = rawItems.map((it: any, idx: number) => ({
            id: `bp-item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            name: it.name || 'Belonging item',
            emoji: it.emoji || '🎒',
            isRequired: Boolean(it.isRequired),
            isPacked: false,
          }));

          setBackpacks(prev => prev.map(b => b.id === mergeIntoId ? {
            ...b,
            items: [...b.items, ...newItems],
          } : b));

          triggerConfetti();
          showToast('Added to Backpack', `Added ${newItems.length} items to "${target.name}".`, '🎒');
          return { success: true, message: `Added ${newItems.length} items to "${target.name}".`, type: 'backpack', id: target.id };
        }
      }

      // Default: Create as new item
      if (finalType === 'routine') {
        const rawActivities = payload.activities || (payload.items ? payload.items.map((i: any) => ({
          name: i.name,
          emoji: i.emoji || '✨',
          durationMinutes: 5,
          color: payload.color || '#f59e0b',
          isLowEnergy: true,
        })) : []);

        const activities: Activity[] = rawActivities.map((a: any, idx: number) => ({
          id: `act-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          name: a.name || 'Step',
          emoji: a.emoji || '✨',
          color: a.color || payload.color || '#f59e0b',
          durationMinutes: Number(a.durationMinutes) || 5,
          completed: false,
          isLowEnergy: a.isLowEnergy ?? true,
        }));

        const newRoutine: Routine = {
          id: `rtn-${Date.now()}`,
          name: itemName,
          emoji: payload.emoji || '☀️',
          color: payload.color || '#f59e0b',
          description: payload.description || '',
          activities,
          estimatedDuration: payload.estimatedDuration || activities.reduce((sum, a) => sum + a.durationMinutes, 0) || 15,
          isArchived: false,
          isMorningRoutine: Boolean(payload.isMorningRoutine),
          versionName: payload.versionName || 'Imported Version',
          linkedBackpackId: payload.linkedBackpackId || '',
          createdAt: new Date().toISOString(),
        };

        setRoutines(prev => [newRoutine, ...prev]);
        triggerConfetti();
        showToast('Routine Imported', `"${newRoutine.name}" is now in your routines.`, '☀️');
        return { success: true, message: `Successfully imported "${newRoutine.name}"!`, type: 'routine', id: newRoutine.id };
      } else if (finalType === 'checklist') {
        const rawItems = payload.items || (payload.activities ? payload.activities.map((a: any) => ({
          name: a.name,
          emoji: a.emoji || '✓',
        })) : []);

        const items = rawItems.map((it: any, idx: number) => ({
          id: `chk-item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          name: it.name || 'Checklist item',
          emoji: it.emoji || '✓',
          completed: false,
        }));

        const newChecklist: Checklist = {
          id: `chk-${Date.now()}`,
          name: itemName,
          emoji: payload.emoji || '📋',
          color: payload.color || '#3b82f6',
          description: payload.description || '',
          items,
          isArchived: false,
          createdAt: new Date().toISOString(),
        };

        setChecklists(prev => [newChecklist, ...prev]);
        triggerConfetti();
        showToast('Checklist Imported', `"${newChecklist.name}" is now in your checklists.`, '📋');
        return { success: true, message: `Successfully imported "${newChecklist.name}"!`, type: 'checklist', id: newChecklist.id };
      } else {
        const rawItems = payload.items || (payload.activities ? payload.activities.map((a: any) => ({
          name: a.name,
          emoji: a.emoji || '🎒',
          isRequired: false,
        })) : []);

        const items: BackpackItem[] = rawItems.map((it: any, idx: number) => ({
          id: `bp-item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          name: it.name || 'Item',
          emoji: it.emoji || '🎒',
          isRequired: Boolean(it.isRequired),
          isPacked: false,
        }));

        const newBackpack: Backpack = {
          id: `bp-${Date.now()}`,
          name: itemName,
          emoji: payload.emoji || '🎒',
          color: payload.color || '#8b5cf6',
          description: payload.description || '',
          items,
          isArchived: false,
          createdAt: new Date().toISOString(),
        };

        setBackpacks(prev => [newBackpack, ...prev]);
        triggerConfetti();
        showToast('Backpack Imported', `"${newBackpack.name}" is now in your backpacks.`, '🎒');
        return { success: true, message: `Successfully imported "${newBackpack.name}"!`, type: 'backpack', id: newBackpack.id };
      }
    } catch (e: any) {
      console.error('Import failed', e);
      return { success: false, message: e?.message || 'Failed to process QR code content.' };
    }
  }, [routines, checklists, backpacks, triggerConfetti, showToast]);

  const clearAll = useCallback(() => {
    storage.clearAllData();
    setSettings(storage.loadSettings());
    setRoutines(storage.loadRoutines());
    setChecklists(storage.loadChecklists());
    setBackpacks(storage.loadBackpacks());
    setCalendarEvents(storage.loadCalendar());
    setBrainDump(storage.loadBrainDump());
    setCompletionHistory(storage.loadCompletionHistory());
    setStreak(storage.loadStreak());
    showToast('Data Reset', 'Nudge has been reset to default state.', '🧹');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        settings,
        themeConfig,
        routines,
        checklists,
        backpacks,
        calendarEvents,
        brainDump,
        completionHistory,
        streak,
        activeTab,
        searchQuery,
        isLowEnergy: settings.isLowEnergyMode,
        selectedDate,

        isStartMyDayOpen,
        guidedRoutine,
        guidedRoutineLowEnergy,
        focusModeItem,
        countdownData,
        isPlanTomorrowOpen,
        isCopyDayOpen,
        isQuickAddOpen,
        isBrainDumpOpen,
        isTemplateLibraryOpen,
        isWidgetsModalOpen,
        isQRScannerOpen,
        shareData,
        toast,

        setActiveTab,
        setSearchQuery,
        setSelectedDate,
        setIsStartMyDayOpen,
        setGuidedRoutine,
        setFocusModeItem,
        setCountdownData,
        setIsPlanTomorrowOpen,
        setIsCopyDayOpen,
        setIsQuickAddOpen,
        setIsBrainDumpOpen,
        setIsTemplateLibraryOpen,
        setIsWidgetsModalOpen,
        setIsQRScannerOpen,
        setShareData,
        dismissToast,

        updateSettings,
        toggleLowEnergyMode,
        launchMentalCountdown,
        triggerConfetti,
        showToast,
        importSharedItem,

        saveRoutine,
        deleteRoutine,
        duplicateRoutine,
        archiveRoutine,
        toggleActivity,
        resetRoutineActivities,
        completeWholeRoutine,

        saveChecklist,
        deleteChecklist,
        duplicateChecklist,
        archiveChecklist,
        toggleChecklistItem,
        resetChecklist,

        saveBackpack,
        deleteBackpack,
        duplicateBackpack,
        archiveBackpack,
        toggleBackpackItem,
        packAllBackpackItems,
        resetBackpack,

        addCalendarEvent,
        toggleCalendarEvent,
        deleteCalendarEvent,

        addBrainDumpItem,
        deleteBrainDumpItem,
        convertBrainDumpItem,

        planTomorrowItems,
        copyDaySchedule,

        // Journal
        journalEntries,
        selectedJournalDate,
        setSelectedJournalDate,
        saveJournalEntry,
        deleteJournalEntry,
        openJournalForDate,

        exportBackup,
        importBackup,
        clearAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
