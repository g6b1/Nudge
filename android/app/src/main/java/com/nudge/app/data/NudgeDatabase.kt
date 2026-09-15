package com.nudge.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.nudge.app.model.*

@Database(
    entities = [
        Routine::class,
        Checklist::class,
        Backpack::class,
        CalendarEvent::class,
        BrainDumpItem::class,
        CompletionHistoryItem::class,
        JournalEntry::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class NudgeDatabase : RoomDatabase() {
    abstract fun nudgeDao(): NudgeDao

    companion object {
        @Volatile
        private var INSTANCE: NudgeDatabase? = null

        fun getDatabase(context: Context): NudgeDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    NudgeDatabase::class.java,
                    "nudge_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
