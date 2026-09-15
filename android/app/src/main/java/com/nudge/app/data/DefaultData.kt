package com.nudge.app.data

import com.nudge.app.model.*
import java.text.SimpleDateFormat
import java.util.*

object DefaultData {
    private fun getTodayDate(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        return sdf.format(Date())
    }

    private fun getCurrentIso(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        return sdf.format(Date())
    }

    val DEFAULT_SETTINGS = UserSettings(
        firstName = "Friend",
        theme = ThemeId.PASTEL,
        fontSize = FontSize.NORMAL,
        layoutDensity = LayoutDensity.COMFORTABLE,
        soundsEnabled = true,
        vibrationEnabled = true,
        completionConfetti = true,
        countdownDuration = 10,
        countdownSound = true,
        countdownVibrate = true,
        countdownAutoStart = true,
        notificationsEnabled = true,
        notificationQuietHoursStart = "22:00",
        notificationQuietHoursEnd = "07:00",
        reminderSound = true,
        dailySummaryEnabled = true,
        isLowEnergyMode = false
    )

    val DEFAULT_ROUTINES = listOf(
        Routine(
            id = "routine-morning-full",
            name = "Morning Routine",
            emoji = "☀️",
            color = "#f59e0b",
            description = "Start the day grounded with gentle hydration and hygiene.",
            versionName = "Full Version",
            isArchived = false,
            isMorningRoutine = true,
            estimatedDuration = 26,
            linkedBackpackId = "backpack-work",
            createdAt = getCurrentIso(),
            recurring = RecurringRule(
                frequency = RecurringFrequency.DAILY,
                time = "07:30",
                startDate = getTodayDate()
            ),
            activities = listOf(
                Activity(id = "act-1", name = "Drink a glass of water", emoji = "💧", color = "#0ea5e9", durationMinutes = 1, isLowEnergy = true),
                Activity(id = "act-2", name = "Wash face & Skincare", emoji = "✨", color = "#ec4899", durationMinutes = 5, isLowEnergy = false),
                Activity(id = "act-3", name = "Brush teeth", emoji = "🪥", color = "#38bdf8", durationMinutes = 3, isLowEnergy = true),
                Activity(id = "act-4", name = "Take morning vitamins", emoji = "💊", color = "#a855f7", durationMinutes = 1, isLowEnergy = true),
                Activity(id = "act-5", name = "Get dressed into comfortable clothes", emoji = "👕", color = "#f97316", durationMinutes = 4, isLowEnergy = true),
                Activity(id = "act-6", name = "Eat a nourishing breakfast", emoji = "🥣", color = "#eab308", durationMinutes = 10, isLowEnergy = false),
                Activity(id = "act-7", name = "Check backpack for daily essentials", emoji = "🎒", color = "#6366f1", durationMinutes = 2, isLowEnergy = true)
            )
        ),
        Routine(
            id = "routine-morning-quick",
            name = "Quick Morning (Low Energy)",
            emoji = "🌱",
            color = "#10b981",
            description = "A gentle, zero-pressure 3-step routine for tough or tired mornings.",
            versionName = "Low Energy",
            isArchived = false,
            isMorningRoutine = true,
            estimatedDuration = 6,
            linkedBackpackId = "backpack-work",
            createdAt = getCurrentIso(),
            activities = listOf(
                Activity(id = "act-q1", name = "Drink water", emoji = "💧", color = "#0ea5e9", durationMinutes = 1, isLowEnergy = true),
                Activity(id = "act-q2", name = "Brush teeth", emoji = "🪥", color = "#38bdf8", durationMinutes = 2, isLowEnergy = true),
                Activity(id = "act-q3", name = "Slip into clean clothes", emoji = "👕", color = "#f97316", durationMinutes = 3, isLowEnergy = true)
            )
        ),
        Routine(
            id = "routine-evening-winddown",
            name = "Evening Wind Down",
            emoji = "🌙",
            color = "#8b5cf6",
            description = "Calm the mind, dim the lights, and prepare for restful sleep.",
            versionName = "Full Version",
            isArchived = false,
            isMorningRoutine = false,
            estimatedDuration = 18,
            createdAt = getCurrentIso(),
            recurring = RecurringRule(
                frequency = RecurringFrequency.DAILY,
                time = "21:30",
                startDate = getTodayDate()
            ),
            activities = listOf(
                Activity(id = "act-e1", name = "Plug phone in away from bed", emoji = "🔌", color = "#6366f1", durationMinutes = 1, isLowEnergy = true),
                Activity(id = "act-e2", name = "Pack backpack for tomorrow", emoji = "🎒", color = "#f59e0b", durationMinutes = 4, isLowEnergy = true),
                Activity(id = "act-e3", name = "Brush teeth & floss", emoji = "🪥", color = "#38bdf8", durationMinutes = 3, isLowEnergy = true),
                Activity(id = "act-e4", name = "5 minutes of quiet reading or stretching", emoji = "📖", color = "#10b981", durationMinutes = 5, isLowEnergy = true),
                Activity(id = "act-e5", name = "Lights out & sleep", emoji = "😴", color = "#475569", durationMinutes = 5, isLowEnergy = true)
            )
        )
    )

    val DEFAULT_CHECKLISTS = listOf(
        Checklist(
            id = "chk-leaving-house",
            name = "Leaving the House",
            emoji = "🚪",
            color = "#f97316",
            description = "Quick door check so nothing essential gets left behind.",
            createdAt = getCurrentIso(),
            items = listOf(
                ChecklistItem(id = "chk-i1", title = "Front door locked", emoji = "🔒"),
                ChecklistItem(id = "chk-i2", title = "Stove & oven turned off", emoji = "🍳"),
                ChecklistItem(id = "chk-i3", title = "Backpack / Work bag in hand", emoji = "🎒"),
                ChecklistItem(id = "chk-i4", title = "Phone, wallet & keys on person", emoji = "🔑"),
                ChecklistItem(id = "chk-i5", title = "Windows securely closed", emoji = "🪟")
            )
        )
    )

    val DEFAULT_BACKPACKS = listOf(
        Backpack(
            id = "backpack-work",
            name = "Daily Bag / Backpack",
            emoji = "🎒",
            color = "#6366f1",
            description = "Your trusty everyday pack for work, study, or commuting.",
            createdAt = getCurrentIso(),
            items = listOf(
                BackpackItem(id = "bp-1", name = "Phone & Charger", emoji = "📱", color = "#38bdf8", isRequired = true, quantity = 1),
                BackpackItem(id = "bp-2", name = "Wallet & Keys", emoji = "🔑", color = "#eab308", isRequired = true, quantity = 1),
                BackpackItem(id = "bp-3", name = "Water bottle", emoji = "💧", color = "#06b6d4", isRequired = true, quantity = 1),
                BackpackItem(id = "bp-4", name = "Transit Pass / ID", emoji = "🪪", color = "#8b5cf6", isRequired = true, quantity = 1),
                BackpackItem(id = "bp-5", name = "Headphones", emoji = "🎧", color = "#ec4899", isRequired = false, quantity = 1),
                BackpackItem(id = "bp-6", name = "Snack / Protein bar", emoji = "🍎", color = "#84cc16", isRequired = false, quantity = 2)
            )
        )
    )

    val THEMES = mapOf(
        ThemeId.PASTEL to ThemeConfig(
            id = ThemeId.PASTEL,
            name = "Pastel Calm",
            isDark = false,
            bgMain = 0xFFF8FAFC,
            bgCard = 0xFFFFFFFF,
            textPrimary = 0xFF0F172A,
            textSecondary = 0xFF475569,
            textMuted = 0xFF94A3B8,
            border = 0xFFE2E8F0,
            accent = 0xFF0D9488,
            accentSubtle = 0xFFCCFBF1
        ),
        ThemeId.DARK to ThemeConfig(
            id = ThemeId.DARK,
            name = "Soft Dark",
            isDark = true,
            bgMain = 0xFF0F172A,
            bgCard = 0xFF1E293B,
            textPrimary = 0xFFF8FAFC,
            textSecondary = 0xFF94A3B8,
            textMuted = 0xFF64748B,
            border = 0xFF334155,
            accent = 0xFF2DD4BF,
            accentSubtle = 0xFF134E4A
        ),
        ThemeId.RETRO to ThemeConfig(
            id = ThemeId.RETRO,
            name = "Retro Paper",
            isDark = false,
            bgMain = 0xFFFDFBF7,
            bgCard = 0xFFFFFFFF,
            textPrimary = 0xFF292524,
            textSecondary = 0xFF57534E,
            textMuted = 0xFFA8A29E,
            border = 0xFFE7E5E4,
            accent = 0xFFD97706,
            accentSubtle = 0xFFFEF3C7
        ),
        ThemeId.NATURE to ThemeConfig(
            id = ThemeId.NATURE,
            name = "Forest Moss",
            isDark = false,
            bgMain = 0xFFF6F8F6,
            bgCard = 0xFFFFFFFF,
            textPrimary = 0xFF142416,
            textSecondary = 0xFF3D5A40,
            textMuted = 0xFF7D9C81,
            border = 0xFFDDE7DF,
            accent = 0xFF2D6A4F,
            accentSubtle = 0xFFE8F5E9
        ),
        ThemeId.MINIMAL to ThemeConfig(
            id = ThemeId.MINIMAL,
            name = "Mono Clean",
            isDark = false,
            bgMain = 0xFFFFFFFF,
            bgCard = 0xFFFAFAFA,
            textPrimary = 0xFF18181B,
            textSecondary = 0xFF52525B,
            textMuted = 0xFFA1A1AA,
            border = 0xFFE4E4E7,
            accent = 0xFF18181B,
            accentSubtle = 0xFFF4F4F5
        ),
        ThemeId.Y2K to ThemeConfig(
            id = ThemeId.Y2K,
            name = "Y2K Cyber",
            isDark = true,
            bgMain = 0xFF0D0B18,
            bgCard = 0xFF181429,
            textPrimary = 0xFFFDF4FF,
            textSecondary = 0xFFD8B4FE,
            textMuted = 0xFFA855F7,
            border = 0xFF2E244E,
            accent = 0xFFC084FC,
            accentSubtle = 0xFF3B0764
        ),
        ThemeId.MONOCHROME to ThemeConfig(
            id = ThemeId.MONOCHROME,
            name = "Monochrome",
            isDark = true,
            bgMain = 0xFF121212,
            bgCard = 0xFF1E1E1E,
            textPrimary = 0xFFE0E0E0,
            textSecondary = 0xFFA0A0A0,
            textMuted = 0xFF707070,
            border = 0xFF2C2C2C,
            accent = 0xFFE0E0E0,
            accentSubtle = 0xFF282828
        )
    )
}
