import { Task, Session, Playlist, UserPreferences } from '../types';
import { taskService } from './taskService';
import { loadFromLocalStorage } from '../utils';

export interface ExportData {
  tasks: Task[];
  sessions: Session[];
  playlists: Playlist[];
  preferences: UserPreferences;
  exportDate: string;
  version: string;
}

class ExportService {
  private version = '1.0.0';

  exportAllData(): ExportData {
    const tasks = taskService.getAllTasks();
    const sessions = loadFromLocalStorage('sessions', [] as Session[]);
    const playlists = loadFromLocalStorage('playlists', [] as Playlist[]);
    const preferences = loadFromLocalStorage('userPreferences', {
      timer: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        autoStartBreaks: false,
        autoStartPomodoros: false
      },
      notifications: {
         enabled: true,
         sound: true,
         desktop: true,
         volume: 0.8
       },
      theme: 'light',
      autoPlay: false
    } as UserPreferences);

    return {
      tasks,
      sessions,
      playlists,
      preferences,
      exportDate: new Date().toISOString(),
      version: this.version
    };
  }

  exportToJSON(): string {
    const data = this.exportAllData();
    return JSON.stringify(data, null, 2);
  }

  exportToTXT(): string {
    const data = this.exportAllData();
    let output = '';

    output += `POMODORO TIMER DATA EXPORT\n`;
    output += `Export Date: ${new Date(data.exportDate).toLocaleString()}\n`;
    output += `Version: ${data.version}\n\n`;

    output += `=== TASKS (${data.tasks.length}) ===\n`;
    data.tasks.forEach((task, index) => {
      output += `${index + 1}. ${task.title}\n`;
      if (task.description) {
        output += `   Description: ${task.description}\n`;
      }
      output += `   Status: ${task.status}\n`;
      output += `   Priority: ${task.priority}\n`;
      output += `   Pomodoros: ${task.pomodorosCompleted}/${task.estimatedPomodoros}\n`;
      if (task.deadline) {
        output += `   Deadline: ${new Date(task.deadline).toLocaleDateString()}\n`;
      }
      output += `   Created: ${new Date(task.createdAt).toLocaleDateString()}\n`;
      if (task.completedAt) {
        output += `   Completed: ${new Date(task.completedAt).toLocaleDateString()}\n`;
      }
      output += `\n`;
    });

    output += `=== SESSIONS (${data.sessions.length}) ===\n`;
    data.sessions.forEach((session, index) => {
      output += `${index + 1}. ${session.type} - ${session.duration} minutes\n`;
      output += `   Date: ${new Date(session.startedAt).toLocaleString()}\n`;
      if (session.taskId) {
        const task = data.tasks.find(t => t.id === session.taskId);
        output += `   Task: ${task?.title || 'Unknown'}\n`;
      }
      output += `   Completed: ${session.completed ? 'Yes' : 'No'}\n\n`;
    });

    output += `=== PLAYLISTS (${data.playlists.length}) ===\n`;
    data.playlists.forEach((playlist, index) => {
      output += `${index + 1}. ${playlist.name}\n`;
      output += `   Tracks: ${playlist.tracks.length}\n`;
      playlist.tracks.forEach((track, trackIndex) => {
        output += `   ${trackIndex + 1}. ${track.title} - ${track.artist}\n`;
      });
      output += `\n`;
    });

    output += `=== STATISTICS ===\n`;
    const completedTasks = data.tasks.filter(t => t.status === 'completed').length;
    const totalPomodoros = data.tasks.reduce((sum, task) => sum + task.pomodorosCompleted, 0);
    const completedSessions = data.sessions.filter(s => s.completed).length;
    
    output += `Total Tasks: ${data.tasks.length}\n`;
    output += `Completed Tasks: ${completedTasks}\n`;
    output += `Task Completion Rate: ${data.tasks.length > 0 ? Math.round((completedTasks / data.tasks.length) * 100) : 0}%\n`;
    output += `Total Pomodoros: ${totalPomodoros}\n`;
    output += `Completed Sessions: ${completedSessions}\n`;
    output += `Total Study Time: ${Math.round((completedSessions * 25) / 60 * 10) / 10} hours\n`;

    return output;
  }

  exportTasksToTXT(): string {
    const tasks = taskService.getAllTasks();
    let output = '';

    output += `TASK LIST EXPORT\n`;
    output += `Export Date: ${new Date().toLocaleString()}\n\n`;

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    if (todoTasks.length > 0) {
      output += `=== TO DO (${todoTasks.length}) ===\n`;
      todoTasks.forEach((task, index) => {
        output += `${index + 1}. ${task.title}\n`;
        if (task.description) {
          output += `   ${task.description}\n`;
        }
        output += `   Priority: ${task.priority}\n`;
        if (task.deadline) {
          output += `   Deadline: ${new Date(task.deadline).toLocaleDateString()}\n`;
        }
        output += `\n`;
      });
    }

    if (inProgressTasks.length > 0) {
      output += `=== IN PROGRESS (${inProgressTasks.length}) ===\n`;
      inProgressTasks.forEach((task, index) => {
        output += `${index + 1}. ${task.title}\n`;
        if (task.description) {
          output += `   ${task.description}\n`;
        }
        output += `   Priority: ${task.priority}\n`;
        output += `   Progress: ${task.pomodorosCompleted}/${task.estimatedPomodoros} pomodoros\n`;
        if (task.deadline) {
          output += `   Deadline: ${new Date(task.deadline).toLocaleDateString()}\n`;
        }
        output += `\n`;
      });
    }

    if (completedTasks.length > 0) {
      output += `=== COMPLETED (${completedTasks.length}) ===\n`;
      completedTasks.forEach((task, index) => {
        output += `${index + 1}. ${task.title}\n`;
        if (task.description) {
          output += `   ${task.description}\n`;
        }
        output += `   Completed: ${new Date(task.completedAt!).toLocaleDateString()}\n`;
        output += `   Pomodoros: ${task.pomodorosCompleted}\n`;
        output += `\n`;
      });
    }

    return output;
  }

  downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  exportAllAsJSON() {
    const content = this.exportToJSON();
    const filename = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(content, filename, 'application/json');
  }

  exportAllAsTXT() {
    const content = this.exportToTXT();
    const filename = `pomodoro-data-${new Date().toISOString().split('T')[0]}.txt`;
    this.downloadFile(content, filename);
  }

  exportTasksAsTXT() {
    const content = this.exportTasksToTXT();
    const filename = `tasks-${new Date().toISOString().split('T')[0]}.txt`;
    this.downloadFile(content, filename);
  }

  importFromJSON(jsonString: string): boolean {
    try {
      const data: ExportData = JSON.parse(jsonString);
      
      if (data.tasks) {
        localStorage.setItem('tasks', JSON.stringify(data.tasks));
      }
      
      if (data.sessions) {
        localStorage.setItem('sessions', JSON.stringify(data.sessions));
      }
      
      if (data.playlists) {
        localStorage.setItem('playlists', JSON.stringify(data.playlists));
      }
      
      if (data.preferences) {
        localStorage.setItem('userPreferences', JSON.stringify(data.preferences));
      }
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  clearAllData() {
    const keys = ['tasks', 'sessions', 'playlists', 'userPreferences', 'timerState', 'musicState'];
    keys.forEach(key => localStorage.removeItem(key));
  }
}

export const exportService = new ExportService();