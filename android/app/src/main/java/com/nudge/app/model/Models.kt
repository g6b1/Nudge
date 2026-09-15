package com.nudge.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

enum class ThemeId {
    PASTEL, DARK, RETRO, MINIMAL, NATURE, Y2K, MONOCHROME
}

enum class LayoutDensity {
    COMFORTABLE, COMPACT
}

enum class FontSize {
    NORMAL, COMPACT, LARGE
}

enum class JournalMood(val emoji: String, val label: String, val colorHex: String) {
    HAPPY("😊", "Happy", "#f59e0b"),
    SAD("😔", "Sad", "#3b82f6"),
    ANXIOUS("😟", "Anxious", "#8b5cf6"),
    CALM("😌", "Calm", "#10b981"),
    EXCITED("🤩", "Excited", "#ec4899"),
    TIRED("😴", "Tired", "#64748b"),
    ANGRY("😡", "Angry", "#ef4444"),
    GRATEFUL("🥹", "Grateful", "#06b6d4"),
    MOTIVATED("🔥", "Motivated", "#ea580c"),
    NEUTRAL("😐", "Neutral", "#78716c");

    companion object {
        fun fromString(value: String): JournalMood {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: CALM
        }
    }
}

enum class RecurringFrequency {
    NONE, DAILY, WEEKDAYS, EVERY_OTHER_DAY, EVERY_3_DAYS, WEEKLY, BIWEEKLY, MONTHLY, SPECIFIC_DAYS
}

data class RecurringRule(
    val frequency: RecurringFrequency = RecurringFrequency.NONE,
    val daysOfWeek: List<Int> = emptyList(), // 0 for Sun, 1 for Mon, etc.
    val time: String? = null, // "HH:mm"
    val startDate: String = "",
    val endDate: String? = null
)

data class Activity(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val emoji: String,
    val color: String,
    val durationMinutes: Int = 3,
    val completed: Boolean = false,
    val completedAt: String? = null,
    val isLowEnergy: Boolean = true
)

@Entity(tableName = "routines")
data class Routine(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val emoji: String,
    val color: String,
    val description: String,
    val activities: List<Activity> = emptyList(),
    val estimatedDuration: Int = 0,
    val isArchived: Boolean = false,
    val isMorningRoutine: Boolean = false,
    val versionName: String = "Full Version",
    val linkedBackpackId: String? = null,
    val dependsOnRoutineId: String? = null,
    val recurring: RecurringRule? = null,
    val createdAt: String = ""
)

data class ChecklistItem(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val completed: Boolean = false,
    val completedAt: String? = null,
    val color: String? = null,
    val emoji: String? = null
)

@Entity(tableName = "checklists")
data class Checklist(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val emoji: String,
    val color: String,
    val description: String = "",
    val items: List<ChecklistItem> = emptyList(),
    val isArchived: Boolean = false,
    val dependsOnRoutineId: String? = null,
    val recurring: RecurringRule? = null,
    val createdAt: String = ""
)

data class BackpackItem(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val emoji: String,
    val color: String,
    val quantity: Int = 1,
    val isRequired: Boolean = true,
    val isPacked: Boolean = false,
    val packedAt: String? = null
)

@Entity(tableName = "backpacks")
data class Backpack(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val emoji: String,
    val color: String,
    val description: String = "",
    val items: List<BackpackItem> = emptyList(),
    val isArchived: Boolean = false,
    val lastPackedAt: String? = null,
    val packForTomorrow: Boolean = false,
    val associatedRoutineId: String? = null,
    val createdAt: String = ""
)

@Entity(tableName = "calendar_events")
data class CalendarEvent(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val title: String,
    val emoji: String,
    val color: String,
    val date: String, // YYYY-MM-DD
    val time: String? = null, // HH:mm
    val type: String = "task", // routine, checklist, backpack, task, reminder
    val targetId: String? = null,
    val completed: Boolean = false,
    val completedAt: String? = null,
    val recurring: RecurringRule? = null
)

@Entity(tableName = "brain_dump")
data class BrainDumpItem(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val text: String,
    val createdAt: String,
    val category: String? = null
)

@Entity(tableName = "completion_history")
data class CompletionHistoryItem(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val date: String, // YYYY-MM-DD
    val timestamp: String,
    val type: String,
    val title: String,
    val emoji: String,
    val durationMinutes: Int? = null
)

@Entity(tableName = "journal_entries")
data class JournalEntry(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val date: String, // YYYY-MM-DD
    val title: String = "",
    val content: String,
    val mood: String = "calm",
    val createdAt: String,
    val updatedAt: String
)

data class StreakState(
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val lastActiveDate: String = "",
    val recoveryDaysCount: Int = 0,
    val totalCompletedRoutines: Int = 0,
    val totalCompletedChecklists: Int = 0,
    val totalCompletedBackpacks: Int = 0
)

data class UserSettings(
    val firstName: String = "Friend",
    val theme: ThemeId = ThemeId.PASTEL,
    val customAccentColor: String? = null,
    val fontSize: FontSize = FontSize.NORMAL,
    val layoutDensity: LayoutDensity = LayoutDensity.COMFORTABLE,
    val soundsEnabled: Boolean = true,
    val vibrationEnabled: Boolean = true,
    val completionConfetti: Boolean = true,
    val countdownDuration: Int = 10,
    val countdownSound: Boolean = true,
    val countdownVibrate: Boolean = true,
    val countdownAutoStart: Boolean = true,
    val notificationsEnabled: Boolean = true,
    val notificationQuietHoursStart: String = "22:00",
    val notificationQuietHoursEnd: String = "07:00",
    val reminderSound: Boolean = true,
    val dailySummaryEnabled: Boolean = true,
    val isLowEnergyMode: Boolean = false,
    val journalReminderEnabled: Boolean = false,
    val journalReminderTimeSlot: String = "evening", // morning, evening, custom
    val journalReminderCustomTime: String = "20:30"
)

data class ThemeConfig(
    val id: ThemeId,
    val name: String,
    val isDark: Boolean,
    val bgMain: Long,
    val bgCard: Long,
    val textPrimary: Long,
    val textSecondary: Long,
    val textMuted: Long,
    val border: Long,
    val accent: Long,
    val accentSubtle: Long
)
