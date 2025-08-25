import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download, Trash2, Edit3, Clock, AlertCircle } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { taskService } from '../services/taskService';
import { exportService } from '../services/exportService';
import { Task, TaskStatus, TaskPriority } from '../types';
import { formatTime, generateId } from '../utils';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    estimatedPomodoros: 1,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTasks();
    taskService.setCallbacks({ onTasksChange: loadTasks });
  }, []);

  const loadTasks = () => {
    setTasks(taskService.getAllTasks());
  };

  const handleAddTask = () => {
    if (!newTask.title?.trim()) return;
    
    const task: Task = {
      id: generateId(),
      title: newTask.title,
      description: newTask.description || '',
      status: 'todo',
      priority: newTask.priority || 'medium',
      estimatedPomodoros: newTask.estimatedPomodoros || 1,
      pomodorosCompleted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    taskService.createTask(task);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      estimatedPomodoros: 1,
    });
    setShowAddForm(false);
  };

  const handleEditTask = () => {
    if (!editingTask?.title?.trim()) return;
    
    const updatedTask = {
      ...editingTask,
      updatedAt: new Date()
    };
    
    taskService.updateTask(editingTask.id, updatedTask);
    setEditingTask(null);
    loadTasks();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    const isOverATask = tasks.some(task => task.id === overId);
    const isOverAColumn = ['todo', 'in-progress', 'completed'].includes(overId as string);

    if (isOverAColumn) {
      const newStatus = overId as TaskStatus;
      if (activeTask.status !== newStatus) {
        const updatedTasks = tasks.map(task => 
          task.id === activeId 
            ? { ...task, status: newStatus }
            : task
        );
        setTasks(updatedTasks);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      }
    } else if (isOverATask) {
      const overTask = tasks.find(task => task.id === overId);
      if (!overTask) return;

      if (activeTask.status === overTask.status) {
        const oldIndex = tasks.findIndex(task => task.id === activeId);
        const newIndex = tasks.findIndex(task => task.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newTasks = arrayMove(tasks, oldIndex, newIndex);
          setTasks(newTasks);
          localStorage.setItem('tasks', JSON.stringify(newTasks));
        }
      } else {
        const updatedTasks = tasks.map(task => 
          task.id === activeId 
            ? { ...task, status: overTask.status }
            : task
        );
        setTasks(updatedTasks);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      }
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    taskService.updateTask(taskId, updates);
  };

  const handleDeleteTask = (taskId: string) => {
    taskService.deleteTask(taskId);
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    handleUpdateTask(taskId, { status, updatedAt: new Date() });
  };

  const handleExportTasks = () => {
    exportService.exportTasksAsTXT();
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    completed: filteredTasks.filter(task => task.status === 'completed')
  };

  const statusLabels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    completed: 'Completed'
  };

  const DroppableColumn = ({ status, children }: { status: TaskStatus; children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: status,
    });

    return (
      <div 
        ref={setNodeRef}
        className={`min-h-[200px] p-4 rounded-lg transition-colors duration-200 ${
          isOver ? 'bg-blue-500/10 border-2 border-blue-500/30' : 'bg-gray-800/50'
        }`}
      >
        {children}
      </div>
    );
  };

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  };

  const SortableTaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.8 : 1,
      zIndex: isDragging ? 1000 : 'auto',
      position: isDragging ? 'relative' : 'static',
    };

    const progress = task.estimatedPomodoros > 0 
      ? (task.pomodorosCompleted / task.estimatedPomodoros) * 100 
      : 0;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="mb-3"
      >
        <Card 
          className={`transition-all duration-200 ${
            isDragging 
              ? 'cursor-grabbing shadow-2xl scale-105 rotate-2' 
              : 'cursor-grab hover:shadow-lg hover:scale-102'
          }`}
          {...attributes}
          {...listeners}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-white/70 mb-2">{task.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                <div onPointerDown={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTask(task)}
                    className="p-1 h-auto hover:bg-white/10"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                </div>
                <div onPointerDown={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 h-auto text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/60 mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>{task.pomodorosCompleted}/{task.estimatedPomodoros} pomodoros</span>
              </div>
              <span className="capitalize">{task.priority} priority</span>
            </div>

            {task.estimatedPomodoros > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <motion.div
                    className="bg-violet-500 h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-2" onPointerDown={(e) => e.stopPropagation()}>
              {(['todo', 'in-progress', 'completed'] as TaskStatus[]).map(status => (
                <Button
                  key={status}
                  variant={task.status === status ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleStatusChange(task.id, status)}
                  className="text-xs px-2 py-1 hover:bg-white/10"
                >
                  {statusLabels[status]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Task Management
          </h1>
          <p className="text-white/70">
            Organize and track your tasks with the Kanban board
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
          <Button variant="ghost" onClick={handleExportTasks}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option value="all">All Priority</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </motion.div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['todo', 'in-progress', 'completed'] as TaskStatus[]).map((status, index) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{statusLabels[status]}</span>
                    <span className="text-sm font-normal text-white/60">
                      {tasksByStatus[status].length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="min-h-[400px]">
                  <DroppableColumn status={status}>
                    <SortableContext
                      items={tasksByStatus[status].map(task => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <AnimatePresence>
                        {tasksByStatus[status].map(task => (
                          <SortableTaskCard key={task.id} task={task} />
                        ))}
                      </AnimatePresence>
                    </SortableContext>
                    
                    {tasksByStatus[status].length === 0 && (
                      <div className="text-center text-white/40 py-8">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>Drop tasks here</p>
                      </div>
                    )}
                  </DroppableColumn>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </DndContext>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Add New Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  
                  <textarea
                    placeholder="Task description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    
                    <input
                      type="number"
                      min="1"
                      max="20"
                      placeholder="Pomodoros"
                      value={newTask.estimatedPomodoros}
                      onChange={(e) => setNewTask({ ...newTask, estimatedPomodoros: parseInt(e.target.value) || 1 })}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleAddTask} className="flex-1">
                      Add Task
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowAddForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Edit Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  
                  <textarea
                    placeholder="Task description (optional)"
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    
                    <input
                      type="number"
                      min="1"
                      max="20"
                      placeholder="Pomodoros"
                      value={editingTask.estimatedPomodoros}
                      onChange={(e) => setEditingTask({ ...editingTask, estimatedPomodoros: parseInt(e.target.value) || 1 })}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleEditTask} className="flex-1">
                      Save Changes
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setEditingTask(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};