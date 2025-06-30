import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../contexts/TasksContext';
import TaskCard from '../components/Task/TaskCard';
import { Calendar, CheckCircle, Clock, Plus, Target, TrendingUp } from 'lucide-react';
import { Task, DayStats, TaskCategory, Priority } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import TaskModal from '../components/Task/TaskModal';

const TodayPage: React.FC = () => {
  const { 
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    moveTaskToToday,
  } = useTasks();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayTasks = tasks.filter(task => task.isToday);

  const stats: DayStats = React.useMemo(() => {
    const completed = todayTasks.filter(task => task.completed).length;
    const total = todayTasks.length;

    const categories = Object.values(TaskCategory).reduce((acc, category) => {
      acc[category] = 0; // Initialize all categories
      return acc;
    }, {} as Record<TaskCategory, number>);
    
    todayTasks.forEach(task => {
      if (categories[task.category] !== undefined) {
        categories[task.category]++;
      }
    });

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
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

  // 根据筛选条件过滤任务
  const filteredTasks = todayTasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  // 按优先级和完成状态排序
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // 未完成的任务排在前面
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const priorityValues = { [Priority.LOW]: 0, [Priority.MEDIUM]: 1, [Priority.HIGH]: 2, [Priority.URGENT]: 3 };
    
    // 我们需要确保处理从后端收到的数字或从前端状态收到的枚举字符串
    const priorityA = typeof a.priority === 'number' ? a.priority : priorityValues[a.priority];
    const priorityB = typeof b.priority === 'number' ? b.priority : priorityValues[b.priority];

    return priorityB - priorityA;
  });

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
      // 今日页面不应该有"新建"功能，但为以防万一保留
      addTask({ ...taskData, isToday: true });
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 - 居中 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">今日计划</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
      </div>

      {/* 操作按钮和筛选区域 */}
      <div className="flex items-center justify-end pb-4 border-b border-gray-200 dark:border-gray-700">
        <Link
          to="/pool"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          从任务池添加
        </Link>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">今日进度</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">{stats.completed}/{stats.total}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* 任务筛选 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">任务列表</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                filter === 'all'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              全部 ({todayTasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                filter === 'pending'
                  ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              进行中 ({stats.total - stats.completed})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                filter === 'completed'
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              已完成 ({stats.completed})
            </button>
          </div>
        </div>

        {/* 任务列表 */}
        {sortedTasks.length === 0 ? (
          todayTasks.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="还没有今日任务"
              description="从任务池中选择任务，开始您的高效一天！"
              action={{
                label: '添加任务到今日',
                to: '/pool',
                icon: Plus,
              }}
            />
            ) : (
            <EmptyState
              icon={filter === 'pending' ? Clock : CheckCircle}
              title={filter === 'pending' ? '没有进行中的任务' : '所有任务都已完成！'}
              description={filter === 'pending' ? '太棒了，享受片刻的宁静吧！' : '开始完成您的任务吧！'}
            />
          )
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
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
          </div>
        )}
      </div>

      {/* 任务编辑模态框 */}
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

      {/* 每日总结 */}
      {stats.total > 0 && stats.completed > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg border border-green-200 dark:border-green-600/50 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-900 dark:text-gray-100">今日成就</h3>
              <h4 className="font-bold text-gray-900 dark:text-gray-100">
                {stats.completionRate === 100 
                  ? "太棒了！今日任务已全部完成！"
                  : `今日任务已完成 ${stats.completed} 个，继续加油！`
                }
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                保持这个势头，明天会更好。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayPage;
