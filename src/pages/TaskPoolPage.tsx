import React, { useState, useMemo } from 'react';
import { useTasks } from '../contexts/TasksContext';
import TaskCard from '../components/Task/TaskCard';
import TaskModal from '../components/Task/TaskModal';
import { Plus, Search, Filter, List, X, ArrowUp, ArrowDown, ChevronsUpDown, Archive } from 'lucide-react';
import { Task, TaskCategory, Priority, TaskFilter } from '../types';
import { getCategoryLabel, getPriorityLabel } from '../lib/taskUtils';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';

const TaskPoolPage: React.FC = () => {
  const { 
    tasks,
    loading, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompleted,
    moveTaskToToday,
    sortConfig,
    setSortConfig,
  } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<TaskFilter>({});
  const [searchTerm, setSearchTerm] = useState('');

  const taskPoolTasks = tasks.filter(task => !task.isToday && !task.completed);

  // 筛选任务
  const filteredTasks = useMemo(() => {
    let filtered = taskPoolTasks;

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 分类筛选
    if (filter.category) {
      filtered = filtered.filter(task => task.category === filter.category);
    }

    // 优先级筛选
    if (filter.priority !== undefined) {
      filtered = filtered.filter(task => task.priority === filter.priority);
    }

    return filtered;
  }, [taskPoolTasks, searchTerm, filter]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'updatedAt'>) => {
    if (editingTask && editingTask.id) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: number) => {
    if (confirm('确定要删除这个任务吗？')) {
      deleteTask(id);
    }
  };

  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const removeFilter = (key: keyof TaskFilter) => {
    const newFilter = { ...filter };
    delete newFilter[key];
    setFilter(newFilter);
  };

  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 - 居中 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">任务池</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          这里是您所有任务的"仓库"，随时准备好被规划进您的每一天。
        </p>
      </div>

      {/* 操作按钮和筛选区域 */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          {/* 这里可以放筛选/排序等控件，如果需要的话 */}
        </div>
        <button
          onClick={handleAddTask}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          新建任务
        </button>
      </div>
      
      {/* 搜索和筛选区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6 space-y-4">
        {/* 第一行：搜索框 */}
          <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索任务标题或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          />
        </div>

        {/* 第二行：筛选器 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类</label>
              <select
                value={filter.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="">全部分类</option>
                {Object.values(TaskCategory).map((category) => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">优先级</label>
              <select
                value={filter.priority ?? ''}
              onChange={(e) => handleFilterChange('priority', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="">全部优先级</option>
                {Object.values(Priority).filter(v => typeof v === 'number').map((priority) => (
                  <option key={priority} value={priority}>
                    {getPriorityLabel(priority as Priority)}
                  </option>
                ))}
              </select>
            </div>

          </div>

        {/* 第三行：激活的筛选条件 */}
        {(Object.keys(filter).length > 0 || searchTerm) && (
          <div className="flex items-center flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">当前筛选:</h4>
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                搜索: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="ml-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filter.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                分类: {getCategoryLabel(filter.category)}
                <button onClick={() => removeFilter('category')} className="ml-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filter.priority !== undefined && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200">
                优先级: {getPriorityLabel(filter.priority)}
                <button onClick={() => removeFilter('priority')} className="ml-1.5 text-orange-500 hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
              清除全部
            </Button>
          </div>
        )}
      </div>

      {/* 任务列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                任务列表 ({filteredTasks.length})
              </h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ChevronsUpDown className="w-4 h-4" />
                  <span>
                    排序方式: {sortConfig.sortBy === 'createdAt' ? '创建时间' : sortConfig.sortBy === 'priority' ? '优先级' : '标题'}
                    ({sortConfig.order === 'asc' ? '升序' : '降序'})
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>选择排序字段</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortConfig({ ...sortConfig, sortBy: 'createdAt' })}>创建时间</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortConfig({ ...sortConfig, sortBy: 'priority' })}>优先级</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortConfig({ ...sortConfig, sortBy: 'title' })}>标题</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>选择排序方向</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortConfig({ ...sortConfig, order: 'asc' })}>
                  <ArrowUp className="w-4 h-4 mr-2" />
                  升序
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortConfig({ ...sortConfig, order: 'desc' })}>
                  <ArrowDown className="w-4 h-4 mr-2" />
                  降序
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                view="pool"
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onAddToToday={() => moveTaskToToday(task.id)}
              />
            ))
          ) : (
            <EmptyState
              icon={List}
              title={taskPoolTasks.length === 0 ? '还没有任务' : '没有符合条件的任务'}
              description={
                taskPoolTasks.length === 0
                  ? '创建您的第一个任务，开始高效管理时间！' 
                  : '尝试调整筛选条件或搜索其他关键词'
                }
              action={
                taskPoolTasks.length === 0
                  ? {
                      label: '创建第一个任务',
                      onClick: handleAddTask,
                      icon: Plus,
                    }
                  : undefined
              }
            />
          )}
        </div>
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
        title={editingTask ? '编辑任务' : '新建任务'}
      />
    </div>
  );
};

export default TaskPoolPage;
