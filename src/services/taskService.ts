import { Task, TaskStatus, TaskPriority } from '../types';
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '../utils';

class TaskService {
  private tasks: Task[] = [];
  private callbacks: {
    onTasksChange?: (tasks: Task[]) => void;
  } = {};

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.tasks = loadFromLocalStorage('tasks', []);
  }

  private saveTasks(): void {
    saveToLocalStorage('tasks', this.tasks);
    this.callbacks.onTasksChange?.(this.tasks);
  }

  createTask(taskData: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    deadline?: Date;
  }): Task {
    const task: Task = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description,
      status: 'todo',
      priority: taskData.priority || 'medium',
      deadline: taskData.deadline,
      createdAt: new Date(),
      updatedAt: new Date(),
      pomodorosCompleted: 0,
      estimatedPomodoros: 4
    };

    this.tasks.push(task);
    this.saveTasks();
    return task;
  }

  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return null;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.saveTasks();
    return this.tasks[taskIndex];
  }

  deleteTask(id: string): boolean {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return false;

    this.tasks.splice(taskIndex, 1);
    this.saveTasks();
    return true;
  }

  getTask(id: string): Task | null {
    return this.tasks.find(task => task.id === id) || null;
  }

  getAllTasks(): Task[] {
    return [...this.tasks];
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  getTasksByPriority(priority: TaskPriority): Task[] {
    return this.tasks.filter(task => task.priority === priority);
  }

  moveTask(taskId: string, newStatus: TaskStatus): Task | null {
    return this.updateTask(taskId, { status: newStatus });
  }

  reorderTasks(taskIds: string[]): void {
    const reorderedTasks: Task[] = [];
    
    taskIds.forEach(id => {
      const task = this.tasks.find(t => t.id === id);
      if (task) {
        reorderedTasks.push(task);
      }
    });

    const remainingTasks = this.tasks.filter(task => !taskIds.includes(task.id));
    this.tasks = [...reorderedTasks, ...remainingTasks];
    this.saveTasks();
  }

  getTasksForExport(): any[] {
    return this.tasks.map(task => ({
      'Task ID': task.id,
      'Title': task.title,
      'Description': task.description || 'No description',
      'Status': task.status,
      'Priority': task.priority,
      'Deadline': task.deadline ? task.deadline.toLocaleDateString() : 'No deadline',
      'Created': task.createdAt.toLocaleDateString(),
      'Updated': task.updatedAt.toLocaleDateString()
    }));
  }

  getTaskStats(): {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    byPriority: Record<TaskPriority, number>;
  } {
    const stats = {
      total: this.tasks.length,
      todo: 0,
      inProgress: 0,
      completed: 0,
      byPriority: {
        low: 0,
        medium: 0,
        high: 0
      } as Record<TaskPriority, number>
    };

    this.tasks.forEach(task => {
      switch (task.status) {
        case 'todo':
          stats.todo++;
          break;
        case 'in-progress':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
      }
      stats.byPriority[task.priority]++;
    });

    return stats;
  }

  searchTasks(query: string): Task[] {
    const lowercaseQuery = query.toLowerCase();
    return this.tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      (task.description && task.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  setCallbacks(callbacks: {
    onTasksChange?: (tasks: Task[]) => void;
  }): void {
    this.callbacks = callbacks;
  }

  clearAllTasks(): void {
    this.tasks = [];
    this.saveTasks();
  }

  importTasks(tasks: Task[]): void {
    this.tasks = tasks.map(task => ({
      ...task,
      id: generateId(),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      deadline: task.deadline ? new Date(task.deadline) : undefined,
      pomodorosCompleted: task.pomodorosCompleted || 0,
      estimatedPomodoros: task.estimatedPomodoros || 4
    }));
    this.saveTasks();
  }
}

export const taskService = new TaskService();