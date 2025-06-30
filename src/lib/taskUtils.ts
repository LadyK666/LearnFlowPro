import { TaskCategory, Priority } from '../types';

// 类别映射函数，支持中文和英文类别
const normalizeCategory = (category: string | TaskCategory): TaskCategory => {
  const categoryMap: Record<string, TaskCategory> = {
    // 英文映射
    'work': TaskCategory.WORK,
    'personal': TaskCategory.PERSONAL,
    'health': TaskCategory.HEALTH,
    'learning': TaskCategory.LEARNING,
    'shopping': TaskCategory.SHOPPING,
    'other': TaskCategory.OTHER,
    // 中文映射
    '工作': TaskCategory.WORK,
    '个人': TaskCategory.PERSONAL,
    '健康': TaskCategory.HEALTH,
    '学习': TaskCategory.LEARNING,
    '购物': TaskCategory.SHOPPING,
    '其他': TaskCategory.OTHER,
  };
  
  const normalized = categoryMap[category.toLowerCase()];
  return normalized || TaskCategory.OTHER;
};

export const getCategoryLabel = (category: string | TaskCategory): string => {
  const normalizedCategory = normalizeCategory(category);
  const labels: Record<TaskCategory, string> = {
    [TaskCategory.WORK]: '工作',
    [TaskCategory.PERSONAL]: '个人',
    [TaskCategory.HEALTH]: '健康',
    [TaskCategory.LEARNING]: '学习',
    [TaskCategory.SHOPPING]: '购物',
    [TaskCategory.OTHER]: '其他',
  };
  return labels[normalizedCategory];
};

export const getPriorityLabel = (priority: Priority | number): string => {
  const labels: Record<number, string> = {
    [Priority.LOW]: '低',
    [Priority.MEDIUM]: '中',
    [Priority.HIGH]: '高',
    [Priority.URGENT]: '紧急',
  };
  return labels[priority as Priority] ?? '低';
};

export const getCategoryColor = (category: string | TaskCategory): string => {
  const normalizedCategory = normalizeCategory(category);
  const colors: Record<TaskCategory, string> = {
    [TaskCategory.WORK]: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-500/30',
    [TaskCategory.PERSONAL]: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-500/30',
    [TaskCategory.HEALTH]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-500/30',
    [TaskCategory.LEARNING]: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-500/30',
    [TaskCategory.SHOPPING]: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-500/30',
    [TaskCategory.OTHER]: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  };
  return colors[normalizedCategory];
};

export const getPriorityColor = (priority: Priority | number): string => {
  const colors: Record<number, string> = {
    [Priority.LOW]: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    [Priority.MEDIUM]: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-500/30',
    [Priority.HIGH]: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-500/30',
    [Priority.URGENT]: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-500/30',
  };
  return colors[priority as Priority];
};

export const getPriorityIcon = (priority: Priority | number): string => {
  const icons: Record<number, string> = {
    [Priority.LOW]: '⚪',
    [Priority.MEDIUM]: '🔵',
    [Priority.HIGH]: '🟠',
    [Priority.URGENT]: '🔴',
  };
  return icons[priority as Priority];
};

export const getCategoryIcon = (category: string | TaskCategory): string => {
  const normalizedCategory = normalizeCategory(category);
  const icons: Record<TaskCategory, string> = {
    [TaskCategory.WORK]: '💼',
    [TaskCategory.PERSONAL]: '🏠',
    [TaskCategory.HEALTH]: '🏃',
    [TaskCategory.LEARNING]: '📚',
    [TaskCategory.SHOPPING]: '🛒',
    [TaskCategory.OTHER]: '📋',
  };
  return icons[normalizedCategory];
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};