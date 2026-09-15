import { 
  Routine, Checklist, Backpack, CalendarEvent, UserSettings, 
  BrainDumpItem, CompletionHistoryItem, StreakState, JournalEntry 
} from '../types';
import { 
  DEFAULT_USER_SETTINGS, DEFAULT_ROUTINES, DEFAULT_CHECKLISTS, 
  DEFAULT_BACKPACKS 
} from './defaults';

const STORAGE_KEYS = {
  SETTINGS: 'nudge_settings',
  ROUTINES: 'nudge_routines',
  CHECKLISTS: 'nudge_checklists',
  BACKPACKS: 'nudge_backpacks',
  CALENDAR: 'nudge_calendar',
  BRAIN_DUMP: 'nudge_brain_dump',
  COMPLETION_HISTORY: 'nudge_completion_history',
  STREAK: 'nudge_streak',
  JOURNAL: 'nudge_journal_entries',
  TUTORIAL_COMPLETED: 'nudge_tutorial_completed',
};

export const formatDateLocal = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateString = (): string => {
  return formatDateLocal(new Date());
};

export const getTomorrowDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateLocal(d);
};

export const storage = {
  loadSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_USER_SETTINGS;
      const parsed = JSON.parse(data);
      const isExplicitlyChosen = parsed.hasSelectedCountdownDuration;
      // If user had the old default of 5 and never explicitly chose it, migrate to new default of 10
      const duration = isExplicitlyChosen 
        ? (parsed.countdownDuration ?? parsed.defaultCountdownDuration ?? 10)
        : (parsed.countdownDuration === 5 ? 10 : (parsed.countdownDuration ?? 10));
      return { 
        ...DEFAULT_USER_SETTINGS, 
        ...parsed,
        countdownDuration: duration,
        defaultCountdownDuration: duration,
      };
    } catch {
      return DEFAULT_USER_SETTINGS;
    }
  },

  saveSettings: (settings: UserSettings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  },

  loadRoutines: (): Routine[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      return data ? JSON.parse(data) : DEFAULT_ROUTINES;
    } catch {
      return DEFAULT_ROUTINES;
    }
  },

  saveRoutines: (routines: Routine[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
    } catch {
      // ignore
    }
  },

  loadChecklists: (): Checklist[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
      return data ? JSON.parse(data) : DEFAULT_CHECKLISTS;
    } catch {
      return DEFAULT_CHECKLISTS;
    }
  },

  saveChecklists: (checklists: Checklist[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
    } catch {
      // ignore
    }
  },

  loadBackpacks: (): Backpack[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BACKPACKS);
      return data ? JSON.parse(data) : DEFAULT_BACKPACKS;
    } catch {
      return DEFAULT_BACKPACKS;
    }
  },

  saveBackpacks: (backpacks: Backpack[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.BACKPACKS, JSON.stringify(backpacks));
    } catch {
      // ignore
    }
  },

  loadCalendar: (): CalendarEvent[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      if (!data) {
        const today = getTodayDateString();
        // Seed today with routines
        return [
          {
            id: 'cal-seed-1',
            title: 'Morning Routine',
            emoji: '☀️',
            color: '#f59e0b',
            date: today,
            time: '08:00',
            type: 'routine',
            targetId: 'routine-morning-full',
            completed: false,
          },
          {
            id: 'cal-seed-2',
            title: 'Self-Care Nudges',
            emoji: '🌿',
            color: '#10b981',
            date: today,
            time: '12:00',
            type: 'checklist',
            targetId: 'chk-selfcare',
            completed: false,
          },
          {
            id: 'cal-seed-3',
            title: 'Work Backpack Check',
            emoji: '🎒',
            color: '#6366f1',
            date: today,
            time: '08:45',
            type: 'backpack',
            targetId: 'backpack-work',
            completed: false,
          },
        ];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveCalendar: (events: CalendarEvent[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events));
    } catch {
      // ignore
    }
  },

  loadBrainDump: (): BrainDumpItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRAIN_DUMP);
      if (!data) {
        return [
          { id: 'bd-1', text: 'Buy toothpaste & fresh floss', createdAt: new Date().toISOString() },
          { id: 'bd-2', text: 'Call doctor for prescription refill', createdAt: new Date().toISOString() },
          { id: 'bd-3', text: 'Find spare phone charger', createdAt: new Date().toISOString() },
        ];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveBrainDump: (items: BrainDumpItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRAIN_DUMP, JSON.stringify(items));
    } catch {
      // ignore
    }
  },

  loadCompletionHistory: (): CompletionHistoryItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETION_HISTORY);
      if (!data) return [];
      const parsed: CompletionHistoryItem[] = JSON.parse(data);
      // Filter out any legacy dummy/seed items if previously stored
      return parsed.filter(item => !item.id.startsWith('hist-'));
    } catch {
      return [];
    }
  },

  saveCompletionHistory: (history: CompletionHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETION_HISTORY, JSON.stringify(history));
    } catch {
      // ignore
    }
  },

  loadStreak: (): StreakState => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (!data) {
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
      return JSON.parse(data);
    } catch {
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
  },

  saveStreak: (streak: StreakState) => {
    try {
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    } catch {
      // ignore
    }
  },

  loadJournalEntries: (): JournalEntry[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveJournalEntries: (entries: JournalEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
    } catch {
      // ignore
    }
  },

  // Full Export
  exportAllData: () => {
    const backup = {
      settings: storage.loadSettings(),
      routines: storage.loadRoutines(),
      checklists: storage.loadChecklists(),
      backpacks: storage.loadBackpacks(),
      calendar: storage.loadCalendar(),
      brainDump: storage.loadBrainDump(),
      history: storage.loadCompletionHistory(),
      streak: storage.loadStreak(),
      journal: storage.loadJournalEntries(),
      exportDate: new Date().toISOString(),
      appName: 'Nudge',
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nudge-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Full Import
  importAllData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.settings) storage.saveSettings(data.settings);
      if (data.routines) storage.saveRoutines(data.routines);
      if (data.checklists) storage.saveChecklists(data.checklists);
      if (data.backpacks) storage.saveBackpacks(data.backpacks);
      if (data.calendar) storage.saveCalendar(data.calendar);
      if (data.brainDump) storage.saveBrainDump(data.brainDump);
      if (data.history) storage.saveCompletionHistory(data.history);
      if (data.streak) storage.saveStreak(data.streak);
      if (data.journal) storage.saveJournalEntries(data.journal);
      return true;
    } catch {
      return false;
    }
  },

  // Dedicated Tutorial Status
  isTutorialCompleted: (): boolean => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED);
      // Exactly two meaningful states:
      // If the parameter exists and is 'true', return true.
      // If it is 'false' or does not exist yet (null), return false.
      return val === 'true';
    } catch {
      return false;
    }
  },

  setTutorialCompleted: (completed: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, completed ? 'true' : 'false');
    } catch {
      // ignore
    }
  },

  markTutorialCompleted: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
    } catch {
      // ignore
    }
  },

  // Clear all
  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

export const exportAllDataAsJSON = () => storage.exportAllData();
export const importDataFromJSON = (jsonData: string) => storage.importAllData(jsonData);
export const resetAllDataToDefault = () => {
  storage.clearAllData();
};
