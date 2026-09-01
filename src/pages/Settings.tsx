import React, { useState, useEffect } from "react";
import {
  Save,
  Bell,
  Clock,
  Volume2,
  Palette,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Check,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { timerService } from "../services/timerService";
import { UserPreferences, TimerSettings, NotificationSettings } from "../types";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  requestNotificationPermission,
} from "../utils";

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences>({
    timer: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false,
    },
    notifications: {
      enabled: true,
      sound: true,
      volume: 0.7,
    },
    theme: "default",
    autoPlay: false,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setPreferences((prev) => ({
      ...prev,
      theme,
    }));
  }, [theme]);

  const loadSettings = () => {
    const defaultPrefs: UserPreferences = {
      timer: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: true,
        autoStartPomodoros: false,
      },
      notifications: {
        enabled: true,
        sound: true,
        volume: 0.7,
      },
      theme,
      autoPlay: false,
    };
    const savedPreferences = loadFromLocalStorage("userPreferences", defaultPrefs);
    const timerSettings = timerService.getSettings();

    if (savedPreferences) {
      const prefsWithTimerSync = {
        ...savedPreferences,
        theme,
        timer: {
          ...savedPreferences.timer,
          workDuration: Math.round(timerSettings.workDuration / 60),
          shortBreakDuration: Math.round(timerSettings.shortBreakDuration / 60),
          longBreakDuration: Math.round(timerSettings.longBreakDuration / 60),
        },
      };
      setPreferences(prefsWithTimerSync);

      if (savedPreferences.theme && savedPreferences.theme !== theme) {
        setTheme(savedPreferences.theme);
      }
    }
  };

  const handleSave = () => {
    const preferencesToSave = {
      ...preferences,
      theme,
    };
    saveToLocalStorage("userPreferences", preferencesToSave);
    const timerSettingsInSeconds = {
      ...preferences.timer,
      workDuration: preferences.timer.workDuration * 60,
      shortBreakDuration: preferences.timer.shortBreakDuration * 60,
      longBreakDuration: preferences.timer.longBreakDuration * 60,
    };
    timerService.updateSettings(timerSettingsInSeconds);
    setHasChanges(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);

    document.documentElement.setAttribute("data-theme", theme);
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("themeChanged", {
          detail: { theme },
        })
      );
    }, 50);
  };

  const handleReset = () => {
    const defaultPreferences: UserPreferences = {
      timer: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: true,
        autoStartPomodoros: false,
      },
      notifications: {
        enabled: true,
        sound: true,
        volume: 0.7,
      },
      theme: "default",
      autoPlay: false,
    };

    setTheme("default");
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  const handleTimerSettingChange = (
    key: keyof TimerSettings,
    value: number | boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleNotificationSettingChange = (
    key: keyof NotificationSettings,
    value: boolean | number
  ) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleRequestNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPreferences((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          enabled: true,
        },
      }));
      setHasChanges(true);
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pomore-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setPreferences(importedSettings);
        setHasChanges(true);
      } catch (error) {
        alert("Invalid settings JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleThemeSelect = (newTheme: "default" | "dark" | "light") => {
    setTheme(newTheme);
    setPreferences((prev) => {
      const updated = { ...prev, theme: newTheme };
      const currentSaved = loadFromLocalStorage("userPreferences", updated);
      saveToLocalStorage("userPreferences", { ...currentSaved, theme: newTheme });
      return updated;
    });
  };

  const themes = [
    { id: "default", label: "Zinc Dark (Default)", preview: "bg-zinc-900 border-zinc-700" },
    { id: "dark", label: "OLED Black", preview: "bg-black border-zinc-800" },
    { id: "light", label: "Clean Light", preview: "bg-zinc-100 border-zinc-300" },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-500" />
            Preferences & Settings
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Configure timer durations, sound alerts, themes, and data backup
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button size="sm" onClick={handleSave} className="gap-1.5 shadow-sm">
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </Button>
          )}
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timer Config */}
        <Card padding="md" className="space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Timer Intervals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Work (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={preferences.timer.workDuration}
                  onChange={(e) =>
                    handleTimerSettingChange("workDuration", parseInt(e.target.value) || 1)
                  }
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Short Break (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={preferences.timer.shortBreakDuration}
                  onChange={(e) =>
                    handleTimerSettingChange("shortBreakDuration", parseInt(e.target.value) || 1)
                  }
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Long Break (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={preferences.timer.longBreakDuration}
                  onChange={(e) =>
                    handleTimerSettingChange("longBreakDuration", parseInt(e.target.value) || 1)
                  }
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Rounds per Cycle
                </label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={preferences.timer.sessionsUntilLongBreak || 4}
                  onChange={(e) =>
                    handleTimerSettingChange(
                      "sessionsUntilLongBreak",
                      parseInt(e.target.value) || 4
                    )
                  }
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-zinc-700 dark:text-zinc-300">Auto-start Breaks</span>
                <input
                  type="checkbox"
                  checked={preferences.timer.autoStartBreaks}
                  onChange={(e) =>
                    handleTimerSettingChange("autoStartBreaks", e.target.checked)
                  }
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-zinc-700 dark:text-zinc-300">Auto-start Pomodoros</span>
                <input
                  type="checkbox"
                  checked={preferences.timer.autoStartPomodoros}
                  onChange={(e) =>
                    handleTimerSettingChange("autoStartPomodoros", e.target.checked)
                  }
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card padding="md" className="space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              Notifications & Sound
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {typeof window !== "undefined" && Notification.permission !== "granted" && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between text-xs">
                <span className="text-amber-600 dark:text-amber-400">
                  Browser notification permission required.
                </span>
                <Button
                  size="sm"
                  onClick={handleRequestNotificationPermission}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-[11px] px-2.5 py-1"
                >
                  Enable
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-zinc-700 dark:text-zinc-300">Enable Desktop Alerts</span>
                <input
                  type="checkbox"
                  checked={preferences.notifications.enabled}
                  onChange={(e) =>
                    handleNotificationSettingChange("enabled", e.target.checked)
                  }
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-zinc-700 dark:text-zinc-300">Play Chime on Finish</span>
                <input
                  type="checkbox"
                  checked={preferences.notifications.sound}
                  onChange={(e) =>
                    handleNotificationSettingChange("sound", e.target.checked)
                  }
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </label>

              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                    Alert Volume
                  </span>
                  <span className="font-mono text-zinc-400">
                    {Math.round(preferences.notifications.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.notifications.volume}
                  onChange={(e) =>
                    handleNotificationSettingChange("volume", parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme / Appearance */}
        <Card padding="md" className="space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-500" />
              Theme & Aesthetic
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 gap-2.5">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeSelect(t.id)}
                    className={`
                      p-3 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between
                      ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                      }
                    `}
                  >
                    <div className={`w-full h-7 rounded border mb-2 ${t.preview}`} />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Data & Backup */}
        <Card padding="md" className="space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500" />
              Data & Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2.5">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleExportSettings}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export JSON
              </Button>

              <label className="flex-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs cursor-pointer"
                  onClick={() => document.getElementById("import-settings")?.click()}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Import JSON
                </Button>
                <input
                  id="import-settings"
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-zinc-400">
              Export your custom preferences and timer cycles to a local JSON file.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
