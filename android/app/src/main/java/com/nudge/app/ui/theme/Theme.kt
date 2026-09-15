package com.nudge.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import com.nudge.app.data.DefaultData
import com.nudge.app.model.ThemeConfig
import com.nudge.app.model.ThemeId

@Composable
fun NudgeTheme(
    themeId: ThemeId = ThemeId.PASTEL,
    content: @Composable () -> Unit
) {
    val themeConfig: ThemeConfig = DefaultData.THEMES[themeId] ?: DefaultData.THEMES[ThemeId.PASTEL]!!

    val colorScheme = if (themeConfig.isDark) {
        darkColorScheme(
            primary = Color(themeConfig.accent),
            background = Color(themeConfig.bgMain),
            surface = Color(themeConfig.bgCard),
            onPrimary = Color.White,
            onBackground = Color(themeConfig.textPrimary),
            onSurface = Color(themeConfig.textPrimary),
            outline = Color(themeConfig.border),
            surfaceVariant = Color(themeConfig.bgCard)
        )
    } else {
        lightColorScheme(
            primary = Color(themeConfig.accent),
            background = Color(themeConfig.bgMain),
            surface = Color(themeConfig.bgCard),
            onPrimary = Color.White,
            onBackground = Color(themeConfig.textPrimary),
            onSurface = Color(themeConfig.textPrimary),
            outline = Color(themeConfig.border),
            surfaceVariant = Color(themeConfig.bgCard)
        )
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
