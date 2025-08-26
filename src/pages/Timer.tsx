import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Clock } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CircularProgress } from "../components/ui/CircularProgress";
import { timerService } from "../services/timerService";
import { TimerState, SessionType } from "../types";
import {
  formatTime,
  calculateProgress,
  getSessionColor,
  showNotification,
  playNotificationSound,
} from "../utils";

export const Timer: React.FC = () => {
  const [timerState, setTimerState] = useState<TimerState>(
    timerService.getState()
  );
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

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

    return () => {
      // timerService.destroy();
    };
  }, []);

  const handleStart = () => {
    timerService.start();
  };

  const handlePause = () => {
    timerService.pause();
  };

  const handleReset = () => {
    timerService.reset();
  };

  const handleSessionSwitch = (sessionType: SessionType) => {
    timerService.switchSession(sessionType);
  };

  const progress = calculateProgress(timerState.timeLeft, timerState.totalTime);
  const sessionColor = getSessionColor(timerState.currentSession);

  const sessionLabels = {
    work: "Work Session",
    "short-break": "Short Break",
    "long-break": "Long Break",
  };

  const sessionIcons = {
    work: Clock,
    "short-break": Coffee,
    "long-break": Coffee,
  };

  const CurrentIcon = sessionIcons[timerState.currentSession];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Pomodoro Timer
        </h1>
        <p className="text-white/70 text-lg">
          Stay focused and productive with the Pomodoro Technique
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="text-center" padding="lg">
            <motion.div
              className="flex flex-col items-center space-y-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <CurrentIcon
                  className="w-6 h-6 text-white"
                  style={{ color: sessionColor }}
                />
                <h2 className="text-2xl font-semibold text-white">
                  {sessionLabels[timerState.currentSession]}
                </h2>
              </div>

              <CircularProgress
                progress={progress}
                size={280}
                strokeWidth={12}
                color={sessionColor}
                className="mb-6"
              >
                <div className="text-center">
                  <motion.div
                    key={timerState.timeLeft}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-5xl md:text-6xl font-bold text-white mb-2"
                  >
                    {formatTime(timerState.timeLeft)}
                  </motion.div>
                  <div className="text-white/60 text-sm uppercase tracking-wider">
                    {timerState.isRunning
                      ? "Running"
                      : timerState.isPaused
                      ? "Paused"
                      : "Ready"}
                  </div>
                </div>
              </CircularProgress>

              <div className="flex items-center space-x-4">
                {!timerState.isRunning ? (
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="px-8 py-4 text-lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {timerState.isPaused ? "Resume" : "Start"}
                  </Button>
                ) : (
                  <Button
                    onClick={handlePause}
                    variant="secondary"
                    size="lg"
                    className="px-8 py-4 text-lg"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                )}

                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="lg"
                  className="px-6 py-4"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </motion.div>
          </Card>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">
                Session Type
              </h3>
              <div className="space-y-2">
                {(["work", "short-break", "long-break"] as SessionType[]).map(
                  (session) => {
                    const Icon = sessionIcons[session];
                    const isActive = timerState.currentSession === session;

                    return (
                      <Button
                        key={session}
                        onClick={() => handleSessionSwitch(session)}
                        variant={isActive ? "primary" : "ghost"}
                        className="w-full justify-start"
                        disabled={timerState.isRunning}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {sessionLabels[session]}
                      </Button>
                    );
                  }
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">
                Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Sessions Completed</span>
                  <span className="text-white font-semibold">
                    {timerState.sessionsCompleted}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Current Session</span>
                  <span className="text-white font-semibold capitalize">
                    {timerState.currentSession.replace("-", " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Progress</span>
                  <span className="text-white font-semibold">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Tips
              </h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>• Focus on one task during work sessions</p>
                <p>• Take breaks to maintain productivity</p>
                <p>• Use background music to stay focused</p>
                <p>• Track your tasks in the Tasks section</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
