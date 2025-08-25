export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type SessionType = 'work' | 'short-break' | 'long-break';
export type SourceType = 'local' | 'youtube' | 'spotify';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  pomodorosCompleted: number;
  estimatedPomodoros: number;
  completedAt?: Date;
}

export interface Session {
  id: string;
  taskId?: string;
  type: SessionType;
  duration: number;
  completed: boolean;
  startedAt: Date;
  endedAt?: Date;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  tracks: Track[];
}

export interface Track {
  id: string;
  playlistId: string;
  title: string;
  artist?: string;
  sourceType: SourceType;
  sourceUrl?: string;
  duration?: number;
  position: number;
}

export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  volume: number;
  customSound?: string;
}

export interface UserPreferences {
  timer: TimerSettings;
  notifications: NotificationSettings;
  theme: 'light' | 'dark';
  autoPlay: boolean;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentSession: SessionType;
  timeLeft: number;
  totalTime: number;
  sessionsCompleted: number;
}

export interface MusicState {
  isPlaying: boolean;
  currentTrack?: Track;
  currentPlaylist?: Playlist;
  volume: number;
  currentTime: number;
  duration: number;
}