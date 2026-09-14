import React, { useRef } from 'react';
import { 
  Download, Upload, RefreshCw, Volume2, ShieldCheck, 
  Palette, User, Bell, Check, Sparkles, Sliders, QrCode 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../utils/defaults';
import { exportAllDataAsJSON, importDataFromJSON, resetAllDataToDefault } from '../utils/storage';
import { sounds } from '../utils/audio';

export const SettingsView: React.FC = () => {
  const { 
    settings, updateSettings, themeConfig, showToast, setIsQRScannerOpen 
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    exportAllDataAsJSON();
    showToast('Backup Exported', 'Your Nudge data file was saved to your downloads.', '📦');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importDataFromJSON(text);
        if (success) {
          showToast('Data Restored', 'Nudge backup restored successfully. Reloading...', '✅');
          setTimeout(() => window.location.reload(), 1200);
        } else {
          showToast('Import Failed', 'Invalid Nudge backup file.', '❌');
        }
      } catch (err) {
        showToast('Import Error', 'Could not parse the backup JSON.', '⚠️');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all Nudge routines, checklists, and data to default starter state?')) {
      resetAllDataToDefault();
      showToast('Reset Complete', 'Nudge reset to default starter routines.', '🌱');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <div id="settings-view" className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: themeConfig.textPrimary }}>
          Settings & Personalization
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
          Customize your experience, appearance, feedback sounds, and device storage.
        </p>
      </div>

      {/* 1. Profile & Personalization */}
      <div 
        className="p-6 rounded-3xl border shadow-xs space-y-4"
        style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
      >
        <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: themeConfig.border }}>
          <User className="w-5 h-5" style={{ color: themeConfig.accent }} />
          <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
            Personalization
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>
              Your First Name (for gentle greetings)
            </label>
            <input
              id="settings-first-name-input"
              type="text"
              placeholder="e.g. Scott, Maya, Alex"
              value={settings.firstName || ''}
              onChange={(e) => updateSettings({ firstName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2"
              style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: themeConfig.textSecondary }}>
              Text Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateSettings({ fontSize: size })}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                    settings.fontSize === size ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: settings.fontSize === size ? themeConfig.accentSubtle : themeConfig.bgMain,
                    borderColor: themeConfig.border,
                    color: settings.fontSize === size ? themeConfig.accentText : themeConfig.textSecondary,
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Themes & Color Palette */}
      <div 
        className="p-6 rounded-3xl border shadow-xs space-y-4"
        style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: themeConfig.border }}>
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5" style={{ color: themeConfig.accent }} />
            <div>
              <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
                Themes & Atmosphere
              </h2>
              <p className="text-xs" style={{ color: themeConfig.textMuted }}>
                Choose the visual calm that best fits your environment and mind.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(THEMES).map(([themeKey, config]) => {
            const isSelected = settings.theme === themeKey;

            return (
              <div
                key={themeKey}
                onClick={() => updateSettings({ theme: themeKey as any })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                  isSelected ? 'ring-2 shadow-sm' : ''
                }`}
                style={{
                  backgroundColor: config.bgCard,
                  borderColor: isSelected ? config.accent : config.border,
                  ringColor: config.accent,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold" style={{ color: config.textPrimary }}>
                      {config.name}
                    </h3>
                    <p className="text-[10px]" style={{ color: config.textMuted }}>
                      {config.isDark ? 'Quiet Dark Canvas' : 'Gentle Light Palette'}
                    </p>
                  </div>
                  {isSelected && (
                    <span 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: config.accent }}
                    >
                      ✓
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-2 border-t" style={{ borderColor: config.border }}>
                  <div className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: config.accent }} />
                  <div className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: config.bgCard }} />
                  <div className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: config.bgMain }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Mental Countdown & Sound Settings */}
      <div 
        className="p-6 rounded-3xl border shadow-xs space-y-4"
        style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
      >
        <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: themeConfig.border }}>
          <Volume2 className="w-5 h-5" style={{ color: themeConfig.accent }} />
          <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
            Audio & Initiation Preferences
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sounds Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border" style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}>
            <div>
              <p className="text-xs font-bold" style={{ color: themeConfig.textPrimary }}>Gentle Sound Effects</p>
              <p className="text-[11px]" style={{ color: themeConfig.textMuted }}>Chimes on check-off & countdown ticks</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !settings.soundEnabled;
                updateSettings({ soundEnabled: next });
                if (next) sounds.playChime();
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                settings.soundEnabled ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Haptics / Vibration */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border" style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}>
            <div>
              <p className="text-xs font-bold" style={{ color: themeConfig.textPrimary }}>Vibration Feedback</p>
              <p className="text-[11px]" style={{ color: themeConfig.textMuted }}>Subtle haptic pulses on launch</p>
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.hapticsEnabled ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                settings.hapticsEnabled ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Countdown duration */}
          <div className="p-3.5 rounded-2xl border space-y-1.5" style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}>
            <label className="text-xs font-bold" style={{ color: themeConfig.textPrimary }}>
              Mental Countdown Duration
            </label>
            <p className="text-[11px]" style={{ color: themeConfig.textMuted }}>
              Seconds to count down when launching a task
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[3, 5, 10].map(secs => (
                <button
                  key={secs}
                  type="button"
                  onClick={() => updateSettings({ defaultCountdownDuration: secs })}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    settings.defaultCountdownDuration === secs ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: settings.defaultCountdownDuration === secs ? themeConfig.accentSubtle : themeConfig.bgCard,
                    borderColor: themeConfig.border,
                    color: settings.defaultCountdownDuration === secs ? themeConfig.accentText : themeConfig.textSecondary,
                  }}
                >
                  {secs} Seconds
                </button>
              ))}
            </div>
          </div>

          {/* Test Sound button */}
          <div className="p-3.5 rounded-2xl border flex flex-col justify-between" style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}>
            <div>
              <p className="text-xs font-bold" style={{ color: themeConfig.textPrimary }}>Audio Sample</p>
              <p className="text-[11px]" style={{ color: themeConfig.textMuted }}>Preview the gentle harmonic sounds</p>
            </div>
            <button
              type="button"
              onClick={() => sounds.playLaunchChord()}
              className="mt-2 py-1.5 px-3 rounded-xl border text-xs font-semibold hover:bg-black/5 flex items-center justify-center gap-1.5"
              style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: themeConfig.accent }} />
              <span>Test Chime</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Privacy & Local Storage Guarantee */}
      <div 
        className="p-6 rounded-3xl border shadow-xs space-y-3"
        style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
      >
        <div className="flex items-center gap-2.5 pb-2 border-b" style={{ borderColor: themeConfig.border }}>
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
            Privacy & 100% Local Device Storage
          </h2>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: themeConfig.textSecondary }}>
          Nudge is built around total personal privacy. No account creation, login, or cloud servers are required.
          All routines, checklists, backpacks, schedules, and streaks live exclusively on this device.
        </p>
      </div>

      {/* 5. Backup, Restore, and Reset */}
      <div 
        className="p-6 rounded-3xl border shadow-xs space-y-4"
        style={{ backgroundColor: themeConfig.bgCard, borderColor: themeConfig.border }}
      >
        <div className="flex items-center gap-2.5 pb-2 border-b" style={{ borderColor: themeConfig.border }}>
          <Download className="w-5 h-5" style={{ color: themeConfig.accent }} />
          <h2 className="font-bold text-base" style={{ color: themeConfig.textPrimary }}>
            Backup & Data Management
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Scan QR */}
          <button
            id="settings-scan-qr-btn"
            type="button"
            onClick={() => setIsQRScannerOpen(true)}
            className="p-4 rounded-2xl border flex flex-col items-center text-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
          >
            <QrCode className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs font-bold" style={{ color: themeConfig.textPrimary }}>Scan QR Code</p>
              <p className="text-[10px]" style={{ color: themeConfig.textMuted }}>Import routine or list</p>
            </div>
          </button>

          {/* Export */}
          <button
            id="export-backup-btn"
            type="button"
            onClick={handleExportBackup}
            className="p-4 rounded-2xl border flex flex-col items-center text-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
          >
            <Download className="w-5 h-5" style={{ color: themeConfig.accent }} />
            <div>
              <p className="text-xs font-bold" style={{ color: themeConfig.textPrimary }}>Export Backup</p>
              <p className="text-[10px]" style={{ color: themeConfig.textMuted }}>Download all data as JSON</p>
            </div>
          </button>

          {/* Import */}
          <label
            className="p-4 rounded-2xl border flex flex-col items-center text-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border }}
          >
            <Upload className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-xs font-bold" style={{ color: themeConfig.textPrimary }}>Restore Backup</p>
              <p className="text-[10px]" style={{ color: themeConfig.textMuted }}>Upload your JSON file</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Reset */}
          <button
            id="reset-defaults-btn"
            type="button"
            onClick={handleResetDefaults}
            className="p-4 rounded-2xl border border-red-200 dark:border-red-950 flex flex-col items-center text-center gap-2 hover:bg-red-500/10 transition-all cursor-pointer"
            style={{ backgroundColor: themeConfig.bgMain }}
          >
            <RefreshCw className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400">Reset to Defaults</p>
              <p className="text-[10px]" style={{ color: themeConfig.textMuted }}>Revert to starter templates</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
