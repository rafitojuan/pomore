import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { taskService } from "../services/taskService";
import { exportService } from "../services/exportService";
import { Task, TaskStatus, TaskPriority } from "../types";
import { formatTime, generateId } from "../utils";

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
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

  const statusLabels = {
    todo: "To Do",
    "in-progress": "In Progress",
    completed: "Completed",
  };

  const priorityColors = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };

  const TaskCard: React.FC<{ task: Task; index: number }> = ({
    task,
    index,
  }) => {
    const progress =
      task.estimatedPomodoros > 0
        ? (task.pomodorosCompleted / task.estimatedPomodoros) * 100
        : 0;

    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-3 select-none"
          >
            <Card
              className={`transition-shadow duration-200 ease-out relative ${
                snapshot.isDragging
                  ? "shadow-2xl z-[9999]"
                  : "hover:shadow-lg z-10"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-white/70 mb-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        priorityColors[task.priority]
                      }`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                      }}
                      className="p-1 h-auto hover:bg-white/10 z-[10000] relative"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="p-1 h-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 z-[10000] relative"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/60">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>
                      {task.pomodorosCompleted}/{task.estimatedPomodoros}{" "}
                      pomodoros
                    </span>
                  </div>
                  <span className="capitalize">{task.priority} priority</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
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
          onChange={(e) =>
            setFilterStatus(e.target.value as TaskStatus | "all")
          }
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) =>
            setFilterPriority(e.target.value as TaskPriority | "all")
          }
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option value="all">All Priority</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </motion.div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["todo", "in-progress", "completed"] as TaskStatus[]).map(
            (status, index) => (
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
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[400px] p-4 rounded-lg transition-all duration-200 ease-out ${
                            snapshot.isDraggingOver
                              ? "border-2 border-violet-500/60 bg-violet-500/5"
                              : "border-2 border-transparent"
                          }`}
                        >
                          {tasksByStatus[status].map((task, index) => (
                            <div key={task.id} className="mb-3">
                              <TaskCard task={task} index={index} />
                            </div>
                          ))}
                          {provided.placeholder}

                          {tasksByStatus[status].length === 0 &&
                            !snapshot.isDraggingOver && (
                              <div className="text-center text-white/40 py-8">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                <p>Drop tasks here</p>
                              </div>
                            )}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </motion.div>
            )
          )}
        </div>
      </DragDropContext>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9998] p-4"
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
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />

                  <textarea
                    placeholder="Task description (optional)"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newTask.priority}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          priority: e.target.value as TaskPriority,
                        })
                      }
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
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          estimatedPomodoros: parseInt(e.target.value) || 1,
                        })
                      }
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9998] p-4"
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
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />

                  <textarea
                    placeholder="Task description (optional)"
                    value={editingTask.description || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={editingTask.priority}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          priority: e.target.value as TaskPriority,
                        })
                      }
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
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          estimatedPomodoros: parseInt(e.target.value) || 1,
                        })
                      }
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
