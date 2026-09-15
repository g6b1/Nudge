package com.nudge.app

import android.app.Application
import com.nudge.app.data.NudgeRepository
import com.nudge.app.notifications.NotificationHelper

class NudgeApplication : Application() {
    lateinit var repository: NudgeRepository
        private set

    override fun onCreate() {
        super.onCreate()
        repository = NudgeRepository(this)
        NotificationHelper.createNotificationChannels(this)
    }
}
