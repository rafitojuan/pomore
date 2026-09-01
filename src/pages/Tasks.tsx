import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Download,
  Trash2,
  Edit3,
  Clock,
  Inbox,
  CheckCircle2,
  CircleDot,
  ListTodo,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { taskService } from "../services/taskService";
import { exportService } from "../services/exportService";
import { Task, TaskStatus, TaskPriority } from "../types";
import { generateId } from "../utils";

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">(
    "all"
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    estimatedPomodoros: 1,
  });

  useEffect(() => {
    loadTasks();
    taskService.setCallbacks({ onTasksChange: loadTasks });
  }, []);

  const loadTasks = () => {
    setTasks(taskService.getAllTasks());
  };

  const handleAddTask = () => {
    if (!newTask.title?.trim()) return;

    const todoTasks = tasks.filter((t) => t.status === "todo");
    const maxOrder =
      todoTasks.length > 0
        ? Math.max(...todoTasks.map((t) => t.order || 0))
        : -1;

    const task: Task = {
      id: generateId(),
      title: newTask.title,
      description: newTask.description || "",
      status: "todo",
      priority: newTask.priority || "medium",
      estimatedPomodoros: newTask.estimatedPomodoros || 1,
      pomodorosCompleted: 0,
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    taskService.createTask(task);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      estimatedPomodoros: 1,
    });
    setShowAddForm(false);
  };

  const handleEditTask = () => {
    if (!editingTask?.title?.trim()) return;

    const updatedTask = {
      ...editingTask,
      updatedAt: new Date(),
    };

    taskService.updateTask(editingTask.id, updatedTask);
    setEditingTask(null);
    loadTasks();
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    const sourceStatus = source.droppableId as TaskStatus;
    const destinationStatus = destination.droppableId as TaskStatus;

    if (sourceStatus !== destinationStatus) {
      const destinationTasks = tasks
        .filter((t) => t.status === destinationStatus)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      const reorderedDestinationTasks = Array.from(destinationTasks);
      reorderedDestinationTasks.splice(destination.index, 0, task);

      const updatedTasks = tasks.map((t) => {
        if (t.id === task.id) {
          return {
            ...t,
            status: destinationStatus,
            order: destination.index,
            updatedAt: new Date(),
          };
        }
        if (t.status === destinationStatus) {
          const newIndex = reorderedDestinationTasks.findIndex(
            (rt) => rt.id === t.id
          );
          return { ...t, order: newIndex, updatedAt: new Date() };
        }
        return t;
      });

      setTasks(updatedTasks);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));

      updatedTasks.forEach((taskToUpdate) => {
        if (
          taskToUpdate.status === destinationStatus ||
          taskToUpdate.id === task.id
        ) {
          taskService.updateTask(taskToUpdate.id, taskToUpdate);
        }
      });
    } else {
      const sourceTasks = tasks
        .filter((t) => t.status === sourceStatus)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      const reorderedTasks = Array.from(sourceTasks);
      const [removed] = reorderedTasks.splice(source.index, 1);
      reorderedTasks.splice(destination.index, 0, removed);

      const updatedTasks = tasks.map((t) => {
        if (t.status === sourceStatus) {
          const newIndex = reorderedTasks.findIndex((rt) => rt.id === t.id);
          return { ...t, order: newIndex, updatedAt: new Date() };
        }
        return t;
      });

      setTasks(updatedTasks);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));

      updatedTasks.forEach((task) => {
        if (task.status === sourceStatus) {
          taskService.updateTask(task.id, task);
        }
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    taskService.deleteTask(taskId);
  };

  const handleExportTasks = () => {
    exportService.exportTasksAsTXT();
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;

    return matchesSearch && matchesPriority;
  });

  const tasksByStatus = {
    todo: filteredTasks
      .filter((task) => task.status === "todo")
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    "in-progress": filteredTasks
      .filter((task) => task.status === "in-progress")
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    completed: filteredTasks
      .filter((task) => task.status === "completed")
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
  };

  const statusConfig = {
    todo: { label: "To Do", icon: ListTodo, color: "text-zinc-500" },
    "in-progress": { label: "In Progress", icon: CircleDot, color: "text-amber-500" },
    completed: { label: "Done", icon: CheckCircle2, color: "text-emerald-500" },
  };

  const priorityBadges = {
    low: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    high: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };

  const TaskCard: React.FC<{ task: Task; index: number }> = ({
    task,
    index,
  }) => {
    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-2.5 select-none"
          >
            <div
              className={`p-3 rounded-lg border bg-white dark:bg-zinc-900 transition-all duration-150 ${
                snapshot.isDragging
                  ? "border-emerald-500 shadow-lg ring-1 ring-emerald-500/20 z-50"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                  {task.title}
                </h4>
                <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTask(task);
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="p-1 text-zinc-400 hover:text-rose-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-3 h-3" />
                  <span>
                    {task.pomodorosCompleted}/{task.estimatedPomodoros}
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-medium border ${
                    priorityBadges[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Task Board
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Organize and break down your work into Pomodoro blocks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Task
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportTasks}>
            <Download className="w-3.5 h-3.5 mr-1" />
            Export TXT
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <select
          value={filterPriority}
          onChange={(e) =>
            setFilterPriority(e.target.value as TaskPriority | "all")
          }
          className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["todo", "in-progress", "completed"] as TaskStatus[]).map((status) => {
            const conf = statusConfig[status];
            const Icon = conf.icon;
            const columnTasks = tasksByStatus[status];

            return (
              <div
                key={status}
                className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 min-h-[450px]"
              >
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${conf.color}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      {conf.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-lg transition-colors duration-150 p-1 ${
                        snapshot.isDraggingOver
                          ? "bg-emerald-500/5 border border-dashed border-emerald-500/40"
                          : ""
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                      {provided.placeholder}

                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-48 text-zinc-400 dark:text-zinc-600 text-xs">
                          <Inbox className="w-6 h-6 mb-1.5 stroke-1" />
                          <span>No tasks</span>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-5"
            >
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Add New Task
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                <textarea
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="Estimated Pomodoros"
                    value={newTask.estimatedPomodoros}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        estimatedPomodoros: parseInt(e.target.value) || 1,
                      })
                    }
                    className="px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={handleAddTask} className="flex-1 text-xs">
                    Create Task
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-5"
            >
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Edit Task
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Task title"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                <textarea
                  placeholder="Description (optional)"
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="Estimated Pomodoros"
                    value={editingTask.estimatedPomodoros}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        estimatedPomodoros: parseInt(e.target.value) || 1,
                      })
                    }
                    className="px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={handleEditTask} className="flex-1 text-xs">
                    Save Changes
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingTask(null)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
