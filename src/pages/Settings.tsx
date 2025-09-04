import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Bell,
  Clock,
  Volume2,
  Palette,
  Download,
  Upload,
  RotateCcw,
  User,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
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

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setPreferences((prev) => ({
      ...prev,
      theme: theme,
    }));
  }, [theme]);

  const loadSettings = () => {
    const defaultPrefs: UserPreferences = {
      timer: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        autoStartBreaks: true,
        autoStartPomodoros: false,
      },
      notifications: {
        enabled: true,
        sound: true,
        volume: 0.7,
      },
      theme: theme,
      autoPlay: false,
    };
    const savedPreferences = loadFromLocalStorage(
      "userPreferences",
      defaultPrefs
    );
    const timerSettings = timerService.getSettings();

    if (savedPreferences) {
      const prefsWithTimerSync = {
        ...savedPreferences,
        theme: theme,
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
      theme: theme,
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

    document.documentElement.setAttribute("data-theme", theme);

    setTimeout(() => {
      const themeChangeEvent = new CustomEvent("themeChanged", {
        detail: { theme },
      });
      window.dispatchEvent(themeChangeEvent);
    }, 50);
  };

  const handleReset = () => {
    const defaultPreferences: UserPreferences = {
      timer: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,

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
    link.download = "pomodoro-settings.json";
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
        alert("Invalid settings file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold theme-text-primary mb-2">
            Settings
          </h1>
          <p className="theme-text-secondary">
            Customize your Pomodoro experience
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {hasChanges && (
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
          <Button variant="ghost" onClick={handleExportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Timer Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={preferences.timer.workDuration}
                    onChange={(e) =>
                      handleTimerSettingChange(
                        "workDuration",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={preferences.timer.shortBreakDuration}
                    onChange={(e) =>
                      handleTimerSettingChange(
                        "shortBreakDuration",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={preferences.timer.longBreakDuration}
                    onChange={(e) =>
                      handleTimerSettingChange(
                        "longBreakDuration",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Sessions until long break
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={preferences.timer.sessionsUntilLongBreak || 4}
                    onChange={(e) =>
                      handleTimerSettingChange(
                        "sessionsUntilLongBreak",
                        parseInt(e.target.value) || 4
                      )
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.timer.autoStartBreaks}
                    onChange={(e) =>
                      handleTimerSettingChange(
                        "autoStartBreaks",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-theme-accent theme-bg-secondary theme-border rounded focus:ring-theme-accent focus:ring-2"
                  />
                  <span className="theme-text-secondary">
                    Auto-start breaks
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.timer.autoStartPomodoros}
                    onChange={(e) =>
                      handleTimerSettingChange(
                        "autoStartPomodoros",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-theme-accent theme-bg-secondary theme-border rounded focus:ring-theme-accent focus:ring-2"
                  />
                  <span className="theme-text-secondary">
                    Auto-start pomodoros
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Notification.permission === "default" && (
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-amber-200 font-medium mb-2">
                        Izinkan Notifikasi Browser
                      </h4>
                      <p className="text-amber-100/80 text-sm mb-3">
                        Untuk menggunakan fitur notifikasi Pomodoro, Anda perlu
                        mengizinkan notifikasi di browser. Klik tombol di bawah
                        ini dan pilih "Allow" atau "Izinkan" ketika browser
                        meminta izin.
                      </p>
                      <Button
                        onClick={handleRequestNotificationPermission}
                        className="bg-amber-500 hover:bg-amber-600 theme-text-primary text-sm px-4 py-2"
                      >
                        Minta Izin Notifikasi
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {Notification.permission === "granted" && (
                <div className={`rounded-lg p-4 mb-4 theme-transition ${
                  theme === 'light' 
                    ? 'bg-green-100 border border-green-300' 
                    : 'bg-green-500/20 border border-green-500/30'
                }`}>
                  <div className="flex items-start space-x-3">
                    <Bell className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      theme === 'light' ? 'text-green-600' : 'text-green-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-medium mb-2 ${
                        theme === 'light' ? 'text-green-800' : 'text-green-200'
                      }`}>
                        Notifikasi Diizinkan
                      </h4>
                      <p className={`text-sm ${
                        theme === 'light' ? 'text-green-700' : 'text-green-100/80'
                      }`}>
                        Notifikasi browser telah diaktifkan! Anda akan menerima
                        pemberitahuan ketika sesi Pomodoro selesai.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {Notification.permission === "denied" && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-red-200 font-medium mb-2">
                        Notifikasi Diblokir
                      </h4>
                      <p className="text-red-100/80 text-sm">
                        Notifikasi telah diblokir untuk situs ini. Untuk
                        mengaktifkan notifikasi:
                        <br />• Klik ikon gembok/info di address bar browser
                        <br />• Ubah pengaturan notifikasi menjadi "Allow" atau
                        "Izinkan"
                        <br />• Refresh halaman ini
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications.enabled}
                  onChange={(e) =>
                    handleNotificationSettingChange("enabled", e.target.checked)
                  }
                  disabled={Notification.permission !== "granted"}
                  className="w-4 h-4 text-theme-accent theme-bg-secondary theme-border rounded focus:ring-theme-accent focus:ring-2 disabled:opacity-50"
                />
                <span
                  className={`theme-text-secondary ${
                    Notification.permission !== "granted" ? "opacity-50" : ""
                  }`}
                >
                  Enable notifications
                  {Notification.permission !== "granted" && (
                    <span className="text-xs theme-text-muted block">
                      Izin notifikasi browser diperlukan
                    </span>
                  )}
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications.sound}
                  onChange={(e) =>
                    handleNotificationSettingChange("sound", e.target.checked)
                  }
                  disabled={!preferences.notifications.enabled}
                  className="w-4 h-4 text-violet-500 bg-white/10 border-white/20 rounded focus:ring-violet-500 focus:ring-2 disabled:opacity-50"
                />
                <span className="theme-text-secondary">
                  Sound notifications
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Notification Volume
                </label>
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-4 h-4 theme-text-muted" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={preferences.notifications.volume}
                    onChange={(e) =>
                      handleNotificationSettingChange(
                        "volume",
                        parseFloat(e.target.value)
                      )
                    }
                    disabled={
                      !preferences.notifications.enabled ||
                      !preferences.notifications.sound
                    }
                    className="flex-1 h-2 theme-bg-secondary rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-sm theme-text-muted w-8">
                    {Math.round(preferences.notifications.volume * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setTheme("default");
                      setHasChanges(true);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme === "default"
                        ? "border-theme-accent theme-accent/20"
                        : "theme-border theme-bg-secondary hover:theme-bg-primary"
                    }`}
                  >
                    <div className="w-full h-8 rounded bg-gradient-to-r from-violet-500 to-purple-600 mb-2"></div>
                    <span className="text-sm theme-text-secondary">
                      Default
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setTheme("light");
                      setHasChanges(true);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme === "light"
                        ? "border-theme-accent theme-accent/20"
                        : "theme-border theme-bg-secondary hover:theme-bg-primary"
                    }`}
                  >
                    <div className="w-full h-8 rounded bg-gradient-to-r from-white to-gray-100 mb-2 border border-gray-200"></div>
                    <span className="text-sm theme-text-secondary">Light</span>
                  </button>

                  <button
                    onClick={() => {
                      setTheme("dark");
                      setHasChanges(true);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme === "dark"
                        ? "border-theme-accent theme-accent/20"
                        : "theme-border theme-bg-secondary hover:theme-bg-primary"
                    }`}
                  >
                    <div className="w-full h-8 rounded bg-gradient-to-r from-black to-gray-800 mb-2"></div>
                    <span className="text-sm theme-text-secondary">Dark</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleExportSettings}
                >
                  <Download className="w-4 h-4 mr-3" />
                  Export Settings
                </Button>

                <label className="block">
                  <Button
                    variant="ghost"
                    className="w-full justify-start cursor-pointer"
                    onClick={() =>
                      document.getElementById("import-settings")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-3" />
                    Import Settings
                  </Button>
                  <input
                    id="import-settings"
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                  />
                </label>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4 mr-3" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm theme-text-secondary">
                <p>
                  <strong className="theme-text-primary">Pomore</strong>
                </p>
                <p>Version 1.1.0</p>
                <p>
                  A productivity app built with React and TypeScript by
                  rafitojuan💓
                </p>
                <p className="pt-2">
                  <strong className="theme-text-primary">Features:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Customizable timer sessions</li>
                  <li>Task management with Kanban board</li>
                  <li>Integrated music player</li>
                  <li>Desktop notifications</li>
                  <li>Data export and import</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
