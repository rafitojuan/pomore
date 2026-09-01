import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Clock, Bell, X, CheckCircle2, Flame } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CircularProgress } from "../components/ui/CircularProgress";
import { timerService } from "../services/timerService";
import { TimerState, SessionType } from "../types";
import {
  formatTime,
  calculateProgress,
  showNotification,
  playNotificationSound,
  requestNotificationPermission,
} from "../utils";

export const Timer: React.FC = () => {
  const [timerState, setTimerState] = useState<TimerState>(
    timerService.getState()
  );
  const [showNotificationBanner, setShowNotificationBanner] = useState(
    typeof window !== 'undefined' && Notification.permission === 'default'
  );

  useEffect(() => {
    timerService.setCallbacks({
      onTick: (state) => setTimerState(state),
      onStateChange: (state) => setTimerState(state),
      onComplete: (sessionType) => {
        const sessionNames = {
          work: "Work Session",
          "short-break": "Short Break",
          "long-break": "Long Break",
        };

        showNotification(`${sessionNames[sessionType]} Completed!`, {
          body: "Time to switch to the next session.",
          icon: "/favicon.ico",
        });

        playNotificationSound();
      },
    });
  }, []);

  const handleStart = () => timerService.start();
  const handlePause = () => timerService.pause();
  const handleReset = () => timerService.reset();
  const handleSessionSwitch = (sessionType: SessionType) => timerService.switchSession(sessionType);

  const handleRequestNotificationPermission = async () => {
    await requestNotificationPermission();
    setShowNotificationBanner(false);
  };

  const progress = calculateProgress(timerState.timeLeft, timerState.totalTime);

  const sessionConfig = {
    work: { label: "Focus Work", color: "#10b981", icon: Clock },
    "short-break": { label: "Short Break", color: "#06b6d4", icon: Coffee },
    "long-break": { label: "Long Break", color: "#8b5cf6", icon: Coffee },
  };

  const current = sessionConfig[timerState.currentSession];
  const CurrentIcon = current.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {showNotificationBanner && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span>Aktifkan notifikasi browser agar tidak melewatkan akhir sesi.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRequestNotificationPermission}
              size="sm"
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-2.5 py-1"
            >
              Izinkan
            </Button>
            <button
              onClick={() => setShowNotificationBanner(false)}
              className="text-zinc-400 hover:text-zinc-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Session Switcher Pills */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {(["work", "short-break", "long-break"] as SessionType[]).map((session) => {
            const isActive = timerState.currentSession === session;
            const Icon = sessionConfig[session].icon;
            return (
              <button
                key={session}
                onClick={() => handleSessionSwitch(session)}
                disabled={timerState.isRunning}
                className={`
                  flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }
                  ${timerState.isRunning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : ''}`} />
                <span>{sessionConfig[session].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Timer Dial */}
        <Card className="md:col-span-2 flex flex-col items-center justify-center p-8">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: current.color }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {current.label}
            </span>
          </div>

          <CircularProgress
            progress={progress}
            size={260}
            strokeWidth={8}
            color={current.color}
            className="mb-8"
          >
            <div className="text-center">
              <motion.div
                key={timerState.timeLeft}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                className="text-6xl font-mono font-bold tracking-tighter text-zinc-900 dark:text-zinc-100 mb-1"
              >
                {formatTime(timerState.timeLeft)}
              </motion.div>
              <div className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
                {timerState.isRunning
                  ? "Focusing"
                  : timerState.isPaused
                  ? "Paused"
                  : "Ready"}
              </div>
            </div>
          </CircularProgress>

          <div className="flex items-center gap-3">
            {!timerState.isRunning ? (
              <Button
                onClick={handleStart}
                size="lg"
                className="px-6 py-2.5 text-sm"
              >
                <Play className="w-4 h-4 mr-1.5" />
                {timerState.isPaused ? "Resume" : "Start Session"}
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                variant="secondary"
                size="lg"
                className="px-6 py-2.5 text-sm"
              >
                <Pause className="w-4 h-4 mr-1.5" />
                Pause
              </Button>
            )}

            <Button
              onClick={handleReset}
              variant="ghost"
              size="lg"
              className="px-4 py-2.5 text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Reset
            </Button>
          </div>
        </Card>

        {/* Side Panel: Metrics & Stats */}
        <div className="space-y-4">
          <Card padding="md">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">
              Session Progress
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Completed
                </span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {timerState.sessionsCompleted}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Round Progress
                </span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  Session Mode
                </span>
                <span className="capitalize text-zinc-900 dark:text-zinc-100 font-medium">
                  {timerState.currentSession.replace("-", " ")}
                </span>
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-zinc-50/50 dark:bg-zinc-900/30">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Focus Tip
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Work on one single task with zero distractions. Pair with instrumental lo-fi in the Music tab to sustain flow state.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
