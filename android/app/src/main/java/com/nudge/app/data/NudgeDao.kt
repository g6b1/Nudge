package com.nudge.app.data

import androidx.room.*
import com.nudge.app.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface NudgeDao {
    // Routines
    @Query("SELECT * FROM routines WHERE isArchived = 0 ORDER BY createdAt DESC")
    fun getAllRoutines(): Flow<List<Routine>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoutine(routine: Routine)

    @Update
    suspend fun updateRoutine(routine: Routine)

    @Query("DELETE FROM routines WHERE id = :id")
    suspend fun deleteRoutine(id: String)

    // Checklists
    @Query("SELECT * FROM checklists WHERE isArchived = 0 ORDER BY createdAt DESC")
    fun getAllChecklists(): Flow<List<Checklist>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChecklist(checklist: Checklist)

    @Update
    suspend fun updateChecklist(checklist: Checklist)

    @Query("DELETE FROM checklists WHERE id = :id")
    suspend fun deleteChecklist(id: String)

    // Backpacks
    @Query("SELECT * FROM backpacks WHERE isArchived = 0 ORDER BY createdAt DESC")
    fun getAllBackpacks(): Flow<List<Backpack>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBackpack(backpack: Backpack)

    @Update
    suspend fun updateBackpack(backpack: Backpack)

    @Query("DELETE FROM backpacks WHERE id = :id")
    suspend fun deleteBackpack(id: String)

    // Calendar Events
    @Query("SELECT * FROM calendar_events ORDER BY date ASC, time ASC")
    fun getAllCalendarEvents(): Flow<List<CalendarEvent>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCalendarEvent(event: CalendarEvent)

    @Update
    suspend fun updateCalendarEvent(event: CalendarEvent)

    @Query("DELETE FROM calendar_events WHERE id = :id")
    suspend fun deleteCalendarEvent(id: String)

    // Brain Dump
    @Query("SELECT * FROM brain_dump ORDER BY createdAt DESC")
    fun getAllBrainDump(): Flow<List<BrainDumpItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBrainDump(item: BrainDumpItem)

    @Query("DELETE FROM brain_dump WHERE id = :id")
    suspend fun deleteBrainDump(id: String)

    // Completion History
    @Query("SELECT * FROM completion_history ORDER BY timestamp DESC")
    fun getAllHistory(): Flow<List<CompletionHistoryItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHistory(item: CompletionHistoryItem)

    @Query("DELETE FROM completion_history")
    suspend fun clearHistory()

    // Journal Entries
    @Query("SELECT * FROM journal_entries ORDER BY date DESC")
    fun getAllJournalEntries(): Flow<List<JournalEntry>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertJournalEntry(entry: JournalEntry)

    @Query("DELETE FROM journal_entries WHERE id = :id")
    suspend fun deleteJournalEntry(id: String)
}
