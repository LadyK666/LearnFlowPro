import React, { useState } from 'react';
import { Task } from '../../types';
import { 
  getCategoryLabel, 
  getPriorityLabel, 
  getCategoryColor, 
  getPriorityColor,
  getCategoryIcon,
  getPriorityIcon,
  formatTime 
} from '../../lib/taskUtils';
import { Check, Edit, Trash2, PlusCircle, Minus, MoreVertical, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface TaskCardProps {
  task: Task;
  view: 'pool' | 'today';
  onToggleComplete?: (id: number) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onAddToToday?: (id: number) => void;
  onRemoveFromToday?: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  view,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddToToday,
  onRemoveFromToday,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
    setShowMenu(false);
  };

  const handleAddToToday = () => {
    if (onAddToToday) {
      onAddToToday(task.id);
    }
    setShowMenu(false);
  };

  const handleRemoveFromToday = () => {
    if (onRemoveFromToday) {
      onRemoveFromToday(task.id);
    }
    setShowMenu(false);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 ${
      task.completed ? 'opacity-70 dark:opacity-60' : ''
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Checkbox for 'Today' view or 'Add to Today' for 'Pool' view */}
          <div className="flex-shrink-0 w-5 h-5 mt-0.5">
            {view === 'today' && onToggleComplete && (
              <button
                onClick={() => onToggleComplete(task.id)}
                className={`w-full h-full rounded border-2 transition-all duration-200 ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {task.completed && <Check className="w-3 h-3 m-auto" />}
              </button>
            )}
            {view === 'pool' && onAddToToday && (
              <button
                onClick={handleAddToToday}
                className="w-full h-full rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center justify-center transition-all duration-200"
                aria-label="添加到今日"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* 任务内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className={`text-sm font-medium ${
                task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {task.title}
              </h3>
            </div>

            {task.description && (
              <p className={`text-sm mb-3 ${
                task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
              }`}>
                {task.description}
              </p>
            )}

            {/* 标签区域 */}
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                getCategoryColor(task.category)
              }`}>
                <span className="mr-1">{getCategoryIcon(task.category)}</span>
                {getCategoryLabel(task.category)}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                getPriorityColor(task.priority)
              }`}>
                <span className="mr-1">{getPriorityIcon(task.priority)}</span>
                {getPriorityLabel(task.priority)}
              </span>
            </div>

            {/* 时间信息 */}
            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
              <div>创建：{formatTime(new Date(task.createdAt))}</div>
              {task.completed && task.completedAt && (
                <div>完成：{formatTime(new Date(task.completedAt))}</div>
              )}
            </div>
          </div>

          {/* 操作菜单 */}
          <div className="flex items-center flex-shrink-0 space-x-2">
            {/* 'More' menu for all views */}
            <div className="relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMenuToggle}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                    <MoreVertical className="w-5 h-5" />
                </Button>
                {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    {onEdit && !task.completed && (
                        <button
                        onClick={handleEdit}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                        >
                        <Edit className="w-4 h-4 mr-2" />
                        编辑任务
                        </button>
                    )}

                    {view === 'today' && onRemoveFromToday && !task.completed && (
                        <button
                        onClick={handleRemoveFromToday}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                        >
                        <Minus className="w-4 h-4 mr-2" />
                        移回任务池
                        </button>
                    )}

                    {onDelete && (
                        <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center"
                        >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除任务
                        </button>
                    )}
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
