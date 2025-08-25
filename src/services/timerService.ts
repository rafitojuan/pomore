import { TimerState, SessionType, TimerSettings } from '../types';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils';

class TimerService {
  private state: TimerState;
  private settings: TimerSettings;
  private intervalId: number | null = null;
  private callbacks: {
    onTick?: (state: TimerState) => void;
    onComplete?: (sessionType: SessionType) => void;
    onStateChange?: (state: TimerState) => void;
  } = {};

  constructor() {
    this.settings = loadFromLocalStorage('timer-settings', {
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      autoStartBreaks: false,
      autoStartPomodoros: false
    });

    this.state = {
      isRunning: false,
      isPaused: false,
      currentSession: 'work',
      timeLeft: this.settings.workDuration,
      totalTime: this.settings.workDuration,
      sessionsCompleted: 0
    };
  }

  start(): void {
    if (this.state.isPaused) {
      this.state.isPaused = false;
      this.state.isRunning = true;
    } else {
      this.state.isRunning = true;
      this.state.isPaused = false;
    }

    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 1000);

    this.notifyStateChange();
  }

  pause(): void {
    this.state.isRunning = false;
    this.state.isPaused = true;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.notifyStateChange();
  }

  reset(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.timeLeft = this.getDurationForSession(this.state.currentSession);
    this.state.totalTime = this.state.timeLeft;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.notifyStateChange();
  }

  switchSession(sessionType: SessionType): void {
    this.state.currentSession = sessionType;
    this.state.timeLeft = this.getDurationForSession(sessionType);
    this.state.totalTime = this.state.timeLeft;
    this.state.isRunning = false;
    this.state.isPaused = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.notifyStateChange();
  }

  private tick(): void {
    if (this.state.timeLeft > 0) {
      this.state.timeLeft--;
      this.callbacks.onTick?.(this.state);
    } else {
      this.completeSession();
    }
  }

  private completeSession(): void {
    const completedSession = this.state.currentSession;
    
    if (completedSession === 'work') {
      this.state.sessionsCompleted++;
    }

    this.state.isRunning = false;
    this.state.isPaused = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.callbacks.onComplete?.(completedSession);

    const nextSession = this.getNextSession();
    if (this.shouldAutoStart(nextSession)) {
      this.switchSession(nextSession);
      this.start();
    } else {
      this.switchSession(nextSession);
    }
  }

  private getNextSession(): SessionType {
    if (this.state.currentSession === 'work') {
      return this.state.sessionsCompleted % 4 === 0 ? 'long-break' : 'short-break';
    }
    return 'work';
  }

  private shouldAutoStart(sessionType: SessionType): boolean {
    if (sessionType === 'work') {
      return this.settings.autoStartPomodoros;
    }
    return this.settings.autoStartBreaks;
  }

  private getDurationForSession(sessionType: SessionType): number {
    switch (sessionType) {
      case 'work':
        return this.settings.workDuration;
      case 'short-break':
        return this.settings.shortBreakDuration;
      case 'long-break':
        return this.settings.longBreakDuration;
      default:
        return this.settings.workDuration;
    }
  }

  private notifyStateChange(): void {
    this.callbacks.onStateChange?.(this.state);
  }

  getState(): TimerState {
    return { ...this.state };
  }

  getSettings(): TimerSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<TimerSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    saveToLocalStorage('timer-settings', this.settings);
    
    if (!this.state.isRunning && !this.state.isPaused) {
      this.state.timeLeft = this.getDurationForSession(this.state.currentSession);
      this.state.totalTime = this.state.timeLeft;
      this.notifyStateChange();
    }
  }

  setCallbacks(callbacks: {
    onTick?: (state: TimerState) => void;
    onComplete?: (sessionType: SessionType) => void;
    onStateChange?: (state: TimerState) => void;
  }): void {
    this.callbacks = callbacks;
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const timerService = new TimerService();