package com.nudge.app.data

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.nudge.app.model.Activity
import com.nudge.app.model.BackpackItem
import com.nudge.app.model.ChecklistItem
import com.nudge.app.model.RecurringRule

class Converters {
    private val gson = Gson()

    @TypeConverter
    fun fromActivityList(value: List<Activity>?): String {
        return gson.toJson(value ?: emptyList<Activity>())
    }

    @TypeConverter
    fun toActivityList(value: String): List<Activity> {
        val listType = object : TypeToken<List<Activity>>() {}.type
        return gson.fromJson(value, listType) ?: emptyList()
    }

    @TypeConverter
    fun fromChecklistItemList(value: List<ChecklistItem>?): String {
        return gson.toJson(value ?: emptyList<ChecklistItem>())
    }

    @TypeConverter
    fun toChecklistItemList(value: String): List<ChecklistItem> {
        val listType = object : TypeToken<List<ChecklistItem>>() {}.type
        return gson.fromJson(value, listType) ?: emptyList()
    }

    @TypeConverter
    fun fromBackpackItemList(value: List<BackpackItem>?): String {
        return gson.toJson(value ?: emptyList<BackpackItem>())
    }

    @TypeConverter
    fun toBackpackItemList(value: String): List<BackpackItem> {
        val listType = object : TypeToken<List<BackpackItem>>() {}.type
        return gson.fromJson(value, listType) ?: emptyList()
    }

    @TypeConverter
    fun fromRecurringRule(value: RecurringRule?): String? {
        return if (value != null) gson.toJson(value) else null
    }

    @TypeConverter
    fun toRecurringRule(value: String?): RecurringRule? {
        return if (value != null) gson.fromJson(value, RecurringRule::class.java) else null
    }
}
