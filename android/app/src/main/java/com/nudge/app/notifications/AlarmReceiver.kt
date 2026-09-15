package com.nudge.app.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmReceiver : BroadcastReceiver {
    constructor() : super()

    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra("title") ?: "Gentle Nudge"
        val message = intent.getStringExtra("message") ?: "Time for your daily routine."
        val emoji = intent.getStringExtra("emoji") ?: "🌱"
        val channelId = intent.getStringExtra("channelId") ?: NotificationHelper.CHANNEL_REMINDERS
        val id = intent.getIntExtra("id", 1001)

        NotificationHelper.showNotification(
            context = context,
            id = id,
            channelId = channelId,
            title = title,
            message = message,
            emoji = emoji
        )
    }
}
