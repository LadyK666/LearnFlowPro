import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Task, Priority, SortConfig } from '../types';
import axios from 'axios';
import { toast } from "sonner";
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>, shouldRefresh?: boolean) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskCompleted: (id: number) => void;
  moveTaskToToday: (id: number) => void;
  importTasks: (importedTasks: Task[]) => Promise<void>;
  clearAllTasks: () => Promise<void>;
  fetchTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ sortBy: 'createdAt', order: 'desc' });
  const { token } = useAuth();

  useEffect(() => {
    const interceptor = apiClient.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(interceptor);
    };
  }, [token]);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Task[]>(
        `/tasks?sortBy=${sortConfig.sortBy}&order=${sortConfig.order}`
      );
      setTasks(response.data);
    } catch (e) {
      const errorMsg = '加载任务失败，请检查网络或联系管理员。';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sortConfig, token]);

  useEffect(() => {
    if (token) {
      const initialLoad = async () => {
        setLoading(true);
        try {
          await apiClient.post('/tasks/reset-daily');
        } catch (resetError) {
          console.error('Failed to run daily reset:', resetError);
        }
        await fetchTasks();
        setLoading(false);
      };
      initialLoad();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [token, fetchTasks]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'updatedAt'>) => {
    // 生成临时 ID，用负数避免与后端冲突
    const tempId = -Date.now();
    const optimisticTask: Task = {
      id: tempId,
      createdAt: new Date().toISOString(),
      completed: false,
      updatedAt: new Date().toISOString(),
      completedAt: undefined,
      ...taskData,
    } as Task;

    setTasks(prev => [optimisticTask, ...prev]);

    try {
      const { data: created } = await apiClient.post<Task>('/tasks', taskData);
      toast.success('任务已成功添加！');
      // 用真实任务替换临时任务
      setTasks(prev => prev.map(t => (t.id === tempId ? created : t)));
    } catch (e) {
      toast.error('添加任务失败。');
      // 回滚
      setTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>, shouldRefresh: boolean = true) => {
    try {
      const { data: updated } = await apiClient.put<Task>(`/tasks/${id}`, updates);
      toast.success("任务已更新。");
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
      if (shouldRefresh) await fetchTasks();
    } catch (e) {
      toast.error('更新任务失败。');
    }
  };

  const deleteTask = async (id: number) => {
    const backup = tasks.find(t => t.id === id);
    if (!backup) return;
    // Optimistic remove
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await apiClient.delete(`/tasks/${id}`);
      toast.success('任务已删除。');
    } catch (e) {
      toast.error('删除任务失败。');
      // rollback
      setTasks(prev => [backup, ...prev]);
    }
  };

  const toggleTaskCompleted = (id: number) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t
      )
    );

    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const completed = !task.completed;
    const completedAt = completed ? new Date().toISOString() : null;

    updateTask(id, { completed, completedAt }, false).catch(() => {
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: task.completed, completedAt: task.completedAt } : t)));
    });
  };

  const moveTaskToToday = (id: number) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, isToday: !t.isToday } : t)));
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    updateTask(id, { isToday: !task.isToday }, false).catch(() => {
      // rollback
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, isToday: task.isToday } : t)));
    });
  };

  const importTasks = async (importedTasks: Task[]) => {
    try {
      await apiClient.post('/tasks/import', { tasks: importedTasks });
      toast.success(`成功导入 ${importedTasks.length} 个任务！`);
      await fetchTasks();
    } catch (e) {
      toast.error('导入任务失败。');
    }
  };

  const clearAllTasks = async () => {
    try {
      await apiClient.delete('/tasks/all');
      toast.success('所有任务已清空！');
      await fetchTasks();
    } catch (e) {
      toast.error('清空任务失败。');
    }
  };

  const value = {
    tasks,
    loading,
    error,
    sortConfig,
    setSortConfig,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    moveTaskToToday,
    importTasks,
    clearAllTasks,
    fetchTasks,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}; 