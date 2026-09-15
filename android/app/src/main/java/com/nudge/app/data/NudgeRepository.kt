package com.nudge.app.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.nudge.app.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class NudgeRepository(private val context: Context) {
    private val db = NudgeDatabase.getDatabase(context)
    private val dao = db.nudgeDao()
    private val prefs: SharedPreferences = context.getSharedPreferences("nudge_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()
    private val scope = CoroutineScope(Dispatchers.IO)

    // Observable flows
    val routines: Flow<List<Routine>> = dao.getAllRoutines()
    val checklists: Flow<List<Checklist>> = dao.getAllChecklists()
    val backpacks: Flow<List<Backpack>> = dao.getAllBackpacks()
    val calendarEvents: Flow<List<CalendarEvent>> = dao.getAllCalendarEvents()
    val brainDump: Flow<List<BrainDumpItem>> = dao.getAllBrainDump()
    val history: Flow<List<CompletionHistoryItem>> = dao.getAllHistory()
    val journalEntries: Flow<List<JournalEntry>> = dao.getAllJournalEntries()

    private val _settings = MutableStateFlow(loadSettings())
    val settings = _settings.asStateFlow()

    private val _streak = MutableStateFlow(loadStreak())
    val streak = _streak.asStateFlow()

    private val _isLowEnergy = MutableStateFlow(false)
    val isLowEnergy = _isLowEnergy.asStateFlow()

    init {
        scope.launch {
            // Check if initial seeding is required
            val existingRoutines = dao.getAllRoutines().first()
            if (existingRoutines.isEmpty()) {
                DefaultData.DEFAULT_ROUTINES.forEach { dao.insertRoutine(it) }
                DefaultData.DEFAULT_CHECKLISTS.forEach { dao.insertChecklist(it) }
                DefaultData.DEFAULT_BACKPACKS.forEach { dao.insertBackpack(it) }
            }
        }
    }

    private fun loadSettings(): UserSettings {
        val json = prefs.getString("user_settings", null)
        return if (json != null) {
            try {
                gson.fromJson(json, UserSettings::class.java)
            } catch (e: Exception) {
                DefaultData.DEFAULT_SETTINGS
            }
        } else {
            DefaultData.DEFAULT_SETTINGS
        }
    }

    fun updateSettings(newSettings: UserSettings) {
        _settings.value = newSettings
        prefs.edit().putString("user_settings", gson.toJson(newSettings)).apply()
    }

    private fun loadStreak(): StreakState {
        val json = prefs.getString("streak_state", null)
        return if (json != null) {
            try {
                gson.fromJson(json, StreakState::class.java)
            } catch (e: Exception) {
                StreakState()
            }
        } else {
            StreakState()
        }
    }

    fun updateStreak(newStreak: StreakState) {
        _streak.value = newStreak
        prefs.edit().putString("streak_state", gson.toJson(newStreak)).apply()
    }

    fun toggleLowEnergyMode() {
        _isLowEnergy.value = !_isLowEnergy.value
    }

    // Record an activity completion and update streak
    suspend fun recordCompletion(type: String, title: String, emoji: String, durationMinutes: Int? = null) {
        val today = getTodayDate()
        val item = CompletionHistoryItem(
            date = today,
            timestamp = getCurrentIso(),
            type = type,
            title = title,
            emoji = emoji,
            durationMinutes = durationMinutes
        )
        dao.insertHistory(item)

        // Update streak
        val current = _streak.value
        val lastDate = current.lastActiveDate
        val newStreak = if (lastDate == today) {
            current.copy(
                totalCompletedRoutines = if (type == "routine") current.totalCompletedRoutines + 1 else current.totalCompletedRoutines,
                totalCompletedChecklists = if (type == "checklist") current.totalCompletedChecklists + 1 else current.totalCompletedChecklists,
                totalCompletedBackpacks = if (type == "backpack") current.totalCompletedBackpacks + 1 else current.totalCompletedBackpacks
            )
        } else {
            val isYesterday = isYesterday(lastDate)
            val updatedStreakCount = if (isYesterday) current.currentStreak + 1 else 1
            val maxStreak = maxOf(updatedStreakCount, current.longestStreak)
            current.copy(
                currentStreak = updatedStreakCount,
                longestStreak = maxStreak,
                lastActiveDate = today,
                totalCompletedRoutines = if (type == "routine") current.totalCompletedRoutines + 1 else current.totalCompletedRoutines,
                totalCompletedChecklists = if (type == "checklist") current.totalCompletedChecklists + 1 else current.totalCompletedChecklists,
                totalCompletedBackpacks = if (type == "backpack") current.totalCompletedBackpacks + 1 else current.totalCompletedBackpacks
            )
        }
        updateStreak(newStreak)
    }

    // CRUD operations
    suspend fun insertRoutine(routine: Routine) = dao.insertRoutine(routine)
    suspend fun updateRoutine(routine: Routine) = dao.updateRoutine(routine)
    suspend fun deleteRoutine(id: String) = dao.deleteRoutine(id)

    suspend fun insertChecklist(checklist: Checklist) = dao.insertChecklist(checklist)
    suspend fun updateChecklist(checklist: Checklist) = dao.updateChecklist(checklist)
    suspend fun deleteChecklist(id: String) = dao.deleteChecklist(id)

    suspend fun insertBackpack(backpack: Backpack) = dao.insertBackpack(backpack)
    suspend fun updateBackpack(backpack: Backpack) = dao.updateBackpack(backpack)
    suspend fun deleteBackpack(id: String) = dao.deleteBackpack(id)

    suspend fun insertCalendarEvent(event: CalendarEvent) = dao.insertCalendarEvent(event)
    suspend fun updateCalendarEvent(event: CalendarEvent) = dao.updateCalendarEvent(event)
    suspend fun deleteCalendarEvent(id: String) = dao.deleteCalendarEvent(id)

    suspend fun insertBrainDump(item: BrainDumpItem) = dao.insertBrainDump(item)
    suspend fun deleteBrainDump(id: String) = dao.deleteBrainDump(id)

    suspend fun insertJournalEntry(entry: JournalEntry) = dao.insertJournalEntry(entry)
    suspend fun deleteJournalEntry(id: String) = dao.deleteJournalEntry(id)

    private fun getTodayDate(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        return sdf.format(Date())
    }

    private fun getCurrentIso(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        return sdf.format(Date())
    }

    private fun isYesterday(dateStr: String): Boolean {
        if (dateStr.isBlank()) return false
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        return try {
            val date = sdf.parse(dateStr) ?: return false
            val cal = Calendar.getInstance()
            cal.add(Calendar.DAY_OF_YEAR, -1)
            sdf.format(cal.time) == sdf.format(date)
        } catch (e: Exception) {
            false
        }
    }
}
