import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, Priority } from '../../types';
import { getCategoryLabel, getPriorityLabel } from '../../lib/taskUtils';
import { X, Save } from 'lucide-react';
import { z } from 'zod';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  editingTask?: Task | null;
  title: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  title,
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: TaskCategory | string;
    priority: number;
    isToday: boolean;
  }>({
    title: '',
    description: '',
    category: TaskCategory.OTHER,
    priority: Priority.MEDIUM,
    isToday: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // If we are editing a real task (it has an id)
    if (editingTask && editingTask.id) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        category: editingTask.category || TaskCategory.OTHER,
        priority: editingTask.priority,
        isToday: editingTask.isToday || false,
      });
    } else {
      // For any new task (top-level or sub-task), reset the form
      setFormData({
        title: '',
        description: '',
        category: TaskCategory.OTHER,
        priority: Priority.MEDIUM,
        isToday: false,
      });
    }
    setErrors({});
  }, [editingTask, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '任务标题不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataToSave: any = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priority: formData.priority,
      isToday: formData.isToday,
    };

    onSave(dataToSave);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-auto shadow-xl animate-in fade-in duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 任务标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              任务标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="输入任务标题..."
              autoFocus
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* 任务描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              任务描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none"
              placeholder="输入任务描述（可选）..."
            />
          </div>

          {/* 任务分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              任务分类
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as TaskCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {Object.values(TaskCategory).map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          {/* 优先级 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              优先级
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {Object.values(Priority).filter(v => typeof v === 'number').map((priority) => (
                <option key={priority} value={priority}>
                  {getPriorityLabel(priority as Priority)}
                </option>
              ))}
            </select>
          </div>

          {/* 是否添加到今日计划 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isToday"
              checked={formData.isToday}
              onChange={(e) => handleChange('isToday', e.target.checked)}
              className="w-4 h-4 text-gray-900 dark:text-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isToday" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              添加到今日计划
            </label>
          </div>

        {/* 底部按钮 */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 -mx-6 -mb-6 px-6 pb-6 mt-6">
          <button
            type="button"
            onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
          >
            取消
          </button>
          <button
              type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            保存
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
