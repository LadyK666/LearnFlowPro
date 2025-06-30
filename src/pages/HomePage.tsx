import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../contexts/TasksContext';
import TaskCard from '../components/Task/TaskCard';
import TaskModal from '../components/Task/TaskModal';
import { Target, CheckCircle, Clock, TrendingUp, Plus } from 'lucide-react';
import { getCategoryLabel, getCategoryIcon } from '../lib/taskUtils';
import { Task, TaskCategory, DayStats, Priority } from '../types';
import { EmptyState } from '@/components/ui/EmptyState';

const HomePage: React.FC = () => {
  const { 
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    moveTaskToToday,
  } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayTasks = tasks.filter(task => task.isToday);

  const stats: DayStats = useMemo(() => {
    const completed = todayTasks.filter(task => task.completed).length;
    
    // 统计所有类别的任务数量，包括字符串类型的类别
    const categories = todayTasks.reduce((acc, task) => {
      const category = task.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: todayTasks.length,
      completed,
      completionRate: todayTasks.length > 0 ? Math.round((completed / todayTasks.length) * 100) : 0,
      categories,
    };
  }, [todayTasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 对今日任务进行排序：未完成 > 已完成，然后按优先级
  const sortedTodayTasks = [...todayTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityValues = { [Priority.LOW]: 0, [Priority.MEDIUM]: 1, [Priority.HIGH]: 2, [Priority.URGENT]: 3 };
    const priorityA = typeof a.priority === 'number' ? a.priority : priorityValues[a.priority];
    const priorityB = typeof b.priority === 'number' ? b.priority : priorityValues[b.priority];
    return priorityB - priorityA;
  });

  const recentTasks = sortedTodayTasks.slice(0, 5);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: number) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      deleteTask(id);
    }
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask({ ...taskData, isToday: true });
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          今日概览
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总任务</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已完成</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">进行中</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.total - stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">完成率</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      {stats.total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">今日进度</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">{stats.completed}/{stats.total}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 分类统计 */}
      {stats.total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">任务分类分布</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(stats.categories).map(([category, count]) => {
              if (count === 0) return null;
              return (
                <div key={category} className="flex items-center space-x-3">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getCategoryLabel(category)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{count} 个任务</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 最近任务 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">今日任务</h3>
            <div className="flex space-x-2">
              <Link
                to="/pool"
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加任务
              </Link>
              <Link
                to="/today"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                查看全部
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6">
          {recentTasks.length === 0 ? (
            <EmptyState
              icon={Target}
              title="还没有今日任务"
              description="从任务池中选择任务，开始您的高效一天！"
              action={{
                label: '添加任务到今日',
                to: '/pool',
                icon: Plus,
              }}
            />
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  view="today"
                  onToggleComplete={() => toggleTaskCompleted(task.id)}
                  onRemoveFromToday={() => moveTaskToToday(task.id)}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
              {todayTasks.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    to="/today"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    查看全部 {todayTasks.length} 个任务 →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        title="编辑任务"
      />
    </div>
  );
};

export default HomePage;
