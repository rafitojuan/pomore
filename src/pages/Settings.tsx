import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, Clock, Volume2, Palette, Download, Upload, RotateCcw, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { timerService } from '../services/timerService';
import { UserPreferences, TimerSettings, NotificationSettings } from '../types';
import { loadFromLocalStorage, saveToLocalStorage, requestNotificationPermission } from '../utils';

export const Settings: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    timer: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,

      autoStartBreaks: true,
      autoStartPomodoros: false
    },
    notifications: {
      enabled: true,
      sound: true,

      volume: 0.7
    },
    theme: 'dark',
    autoPlay: false
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const defaultPrefs: UserPreferences = {
      timer: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        autoStartBreaks: true,
        autoStartPomodoros: false
      },
      notifications: {
        enabled: true,
        sound: true,
        volume: 0.7
      },
      theme: 'dark' as const,
      autoPlay: false
    };
    const savedPreferences = loadFromLocalStorage('userPreferences', defaultPrefs);
    if (savedPreferences) {
      setPreferences(savedPreferences);
    }
  };

  const handleSave = () => {
    saveToLocalStorage('userPreferences', preferences);
    timerService.updateSettings(preferences.timer);
    setHasChanges(false);
  };

  const handleReset = () => {
    const defaultPreferences: UserPreferences = {
      timer: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,

        autoStartBreaks: true,
        autoStartPomodoros: false
      },
      notifications: {
        enabled: true,
        sound: true,
        volume: 0.7
      },
      theme: 'dark',
      autoPlay: false
    };
    
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  const handleTimerSettingChange = (key: keyof TimerSettings, value: number | boolean) => {
    setPreferences(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleNotificationSettingChange = (key: keyof NotificationSettings, value: boolean | number) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleRequestNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {

    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pomodoro-settings.json';
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
        alert('Invalid settings file');
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-white/70">
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
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={preferences.timer.workDuration}
                    onChange={(e) => handleTimerSettingChange('workDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={preferences.timer.shortBreakDuration}
                    onChange={(e) => handleTimerSettingChange('shortBreakDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={preferences.timer.longBreakDuration}
                    onChange={(e) => handleTimerSettingChange('longBreakDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                

              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.timer.autoStartBreaks}
                    onChange={(e) => handleTimerSettingChange('autoStartBreaks', e.target.checked)}
                    className="w-4 h-4 text-violet-500 bg-white/10 border-white/20 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <span className="text-white/80">Auto-start breaks</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.timer.autoStartPomodoros}
                    onChange={(e) => handleTimerSettingChange('autoStartPomodoros', e.target.checked)}
                    className="w-4 h-4 text-violet-500 bg-white/10 border-white/20 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <span className="text-white/80">Auto-start pomodoros</span>
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
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications.enabled}
                  onChange={(e) => handleNotificationSettingChange('enabled', e.target.checked)}
                  className="w-4 h-4 text-violet-500 bg-white/10 border-white/20 rounded focus:ring-violet-500 focus:ring-2"
                />
                <span className="text-white/80">Enable notifications</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications.sound}
                  onChange={(e) => handleNotificationSettingChange('sound', e.target.checked)}
                  disabled={!preferences.notifications.enabled}
                  className="w-4 h-4 text-violet-500 bg-white/10 border-white/20 rounded focus:ring-violet-500 focus:ring-2 disabled:opacity-50"
                />
                <span className="text-white/80">Sound notifications</span>
              </label>
              

              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Notification Volume
                </label>
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-4 h-4 text-white/60" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={preferences.notifications.volume}
                    onChange={(e) => handleNotificationSettingChange('volume', parseFloat(e.target.value))}
                    disabled={!preferences.notifications.enabled || !preferences.notifications.sound}
                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-sm text-white/60 w-8">
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
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Theme
                </label>
                <select
                  value={preferences.theme}
                  onChange={(e) => {
                    setPreferences(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }));
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
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
                    onClick={() => document.getElementById('import-settings')?.click()}
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
              <div className="space-y-2 text-sm text-white/70">
                <p><strong className="text-white">Pomodoro Timer</strong></p>
                <p>Version 1.0.0</p>
                <p>A productivity app built with React and TypeScript</p>
                <p className="pt-2">
                  <strong className="text-white">Features:</strong>
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