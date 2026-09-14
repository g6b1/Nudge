export type ThemeId = 'pastel' | 'dark' | 'retro' | 'minimal' | 'nature' | 'y2k' | 'monochrome';

export type LayoutDensity = 'comfortable' | 'compact';
export type FontSize = 'normal' | 'compact' | 'large';

export interface UserSettings {
  firstName: string;
  theme: ThemeId;
  customAccentColor?: string;
  fontSize: FontSize;
  layoutDensity: LayoutDensity;
  soundsEnabled: boolean;
  vibrationEnabled: boolean;
  completionConfetti: boolean;
  // Countdown / Just Start Settings
  countdownDuration: number; // 3, 5, 10, 30, etc.
  countdownSound: boolean;
  countdownVibrate: boolean;
  countdownAutoStart: boolean;
  countdownTiming: 'before_task' | 'before_reminder';
  // Notifications
  notificationsEnabled: boolean;
  notificationQuietHoursStart: string; // e.g. "22:00"
  notificationQuietHoursEnd: string; // e.g. "07:00"
  reminderSound: boolean;
  dailySummaryEnabled: boolean;
  // Low Energy default toggle
  isLowEnergyMode: boolean;
  // Sound / Haptic settings
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
  defaultCountdownDuration?: number;
  // Journal Reminders
  journalReminderEnabled?: boolean;
  journalReminderTimeSlot?: 'morning' | 'evening' | 'custom';
  journalReminderCustomTime?: string;
}

export interface Activity {
  id: string;
  name: string;
  emoji: string;
  color: string;
  durationMinutes?: number;
  completed: boolean;
  completedAt?: string;
  isLowEnergy?: boolean; // included in quick / low energy version
}

export type RecurringFrequency = 
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'every_other_day'
  | 'every_3_days'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'specific_days';

export interface RecurringRule {
  frequency: RecurringFrequency;
  daysOfWeek?: number[]; // 0 for Sun, 1 for Mon, etc.
  time?: string; // "08:00"
  startDate: string; // YYYY-MM-DD
  endDate?: string;
}

export interface Routine {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  activities: Activity[];
  estimatedDuration: number; // total in minutes
  isArchived: boolean;
  isMorningRoutine: boolean;
  versionName?: string; // e.g. "Full" or "Low Energy"
  linkedBackpackId?: string; // automatic backpack trigger upon completion
  dependsOnRoutineId?: string; // routine dependency
  recurring?: RecurringRule;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  color?: string;
  emoji?: string;
}

export interface Checklist {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description?: string;
  items: ChecklistItem[];
  isArchived: boolean;
  dependsOnRoutineId?: string;
  recurring?: RecurringRule;
  createdAt: string;
}

export interface BackpackItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
  quantity?: number;
  isRequired: boolean; // missing-item alert
  isPacked: boolean;
  packedAt?: string;
}

export interface Backpack {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description?: string;
  items: BackpackItem[];
  isArchived: boolean;
  lastPackedAt?: string;
  packForTomorrow?: boolean;
  associatedRoutineId?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  emoji: string;
  color: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: 'routine' | 'checklist' | 'backpack' | 'task' | 'reminder';
  targetId?: string;
  completed: boolean;
  completedAt?: string;
  recurring?: RecurringRule;
}

export interface BrainDumpItem {
  id: string;
  text: string;
  createdAt: string;
  category?: string;
}

export interface CompletionHistoryItem {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  type: 'routine' | 'checklist' | 'backpack' | 'activity';
  title: string;
  emoji: string;
  durationMinutes?: number;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  recoveryDaysCount: number; // consecutive returning days after a break
  totalCompletedRoutines: number;
  totalCompletedChecklists: number;
  totalCompletedBackpacks: number;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  bgMain: string;
  bgCard: string;
  bgCardHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentSubtle: string;
  accentText: string;
}

export interface TemplateItem {
  id: string;
  type: 'routine' | 'checklist' | 'backpack';
  category: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  data: Partial<Routine> | Partial<Checklist> | Partial<Backpack> | any;
  payload?: any;
}

export type JournalMood = 
  | 'happy' 
  | 'sad' 
  | 'anxious' 
  | 'calm' 
  | 'excited' 
  | 'tired' 
  | 'angry' 
  | 'grateful' 
  | 'motivated' 
  | 'neutral';

export interface MoodOption {
  id: JournalMood;
  label: string;
  emoji: string;
  color: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  content: string;
  mood: JournalMood;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

