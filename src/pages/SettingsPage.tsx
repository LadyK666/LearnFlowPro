import React, { useState, useRef, useMemo } from 'react';
import { useTasks } from '../contexts/TasksContext';
import { Settings, Download, Upload, Trash2, CheckCircle, AlertTriangle, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

const SettingsPage: React.FC = () => {
  const { tasks, importTasks, clearAllTasks } = useTasks();
  const { setTheme, theme } = useTheme();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);
  const [isImportAlertOpen, setIsImportAlertOpen] = useState(false);
  const [tasksToImport, setTasksToImport] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportData = () => {
    try {
      const dataToExport = tasks.map(task => {
        const { priority, ...rest } = task;
        const priorityValues: { [key: string]: number } = { URGENT: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
        return { ...rest, priority: priorityValues[priority] ?? 0 };
      });

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-day-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification('success', '数据导出成功！');
    } catch (error) {
      showNotification('error', '数据导出失败，请重试。');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          const validTasks = importedData.filter(task => 
            typeof task.title === 'string' && 
            typeof task.category === 'string' && 
            typeof task.priority === 'number'
          );
          
          if (validTasks.length > 0) {
            setTasksToImport(validTasks);
            setIsImportAlertOpen(true);
          } else {
            showNotification('error', '导入的文件没有包含有效的任务。');
          }
        } else {
          showNotification('error', '导入的文件格式不正确，必须是任务数组。');
        }
      } catch (error) {
        showNotification('error', '文件解析失败，请检查文件是否为正确的JSON格式。');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };
  
  const confirmImport = async () => {
    if (tasksToImport) {
      const priorityMap: { [key: number]: string } = { 3: 'URGENT', 2: 'HIGH', 1: 'MEDIUM', 0: 'LOW' };
      const tasksWithPriorityString = tasksToImport.map(task => ({
        ...task,
        priority: priorityMap[task.priority] ?? 'LOW'
      }));

      await importTasks(tasksWithPriorityString as any);
      showNotification('success', `成功导入 ${tasksToImport.length} 个任务！`);
    }
    setIsImportAlertOpen(false);
    setTasksToImport(null);
  };
  
  const confirmClear = async () => {
    await clearAllTasks();
    showNotification('warning', '所有数据已清空！');
    setIsClearAlertOpen(false);
  };

  const stats = useMemo(() => {
    const todayTasks = tasks.filter(t => t.isToday);
    const poolTasks = tasks.filter(t => !t.isToday && !t.completed);

    return {
      total: todayTasks.length + poolTasks.length,
      completed: tasks.filter(t => t.completed).length, // This can remain as total completed for a general stat
      today: todayTasks.length,
      categories: [...new Set(tasks.map(t => t.category))].length,
    }
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* 通知 */}
      {notification && (
        <div className={`rounded-lg p-4 border-l-4 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-400 text-green-800'
            : notification.type === 'error'
            ? 'bg-red-50 border-red-400 text-red-800'
            : 'bg-yellow-50 border-yellow-400 text-yellow-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <AlertTriangle className="w-5 h-5 mr-2" />}
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 mr-2" />}
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      {/* 页面头部 - 居中 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">设置</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">管理您的应用配置和数据</p>
      </div>

      {/* 外观设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">外观</h3>
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center">
            <div className="mr-3">
              {theme === 'light' && <Sun className="w-5 h-5 text-orange-500" />}
              {theme === 'dark' && <Moon className="w-5 h-5 text-indigo-500" />}
              {theme === 'system' && <Monitor className="w-5 h-5 text-gray-500" />}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">应用主题</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">选择应用在浅色、深色或系统模式下的外观</p>
            </div>
          </div>
          <div className="flex space-x-2 rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
            <Button
              variant={theme === 'light' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('light')}
              className="w-24"
            >
              <Sun className="w-4 h-4 mr-2" />
              浅色
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="w-24"
            >
              <Moon className="w-4 h-4 mr-2" />
              深色
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('system')}
              className="w-24"
            >
              <Monitor className="w-4 h-4 mr-2" />
              系统
            </Button>
          </div>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">数据统计</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">总任务数</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">已完成</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">今日任务</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.categories}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">使用分类</p>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">数据管理</h3>
        
        <div className="space-y-4">
          {/* 导出数据 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">导出数据</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">下载所有任务数据的备份文件</p>
              </div>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              导出
            </button>
          </div>

          {/* 导入数据 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">导入数据</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">从备份文件恢复任务数据</p>
              </div>
            </div>
            <label className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200 cursor-pointer">
              选择文件
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* 清空数据 */}
          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-200">清空所有数据</h4>
                <p className="text-sm text-red-700 dark:text-red-300">删除所有任务数据，此操作不可撤销</p>
              </div>
            </div>
            <button
              onClick={() => setIsClearAlertOpen(true)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              清空
            </button>
          </div>
        </div>
      </div>

      {/* 应用信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">应用信息</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">应用名称：</span>
            <span className="text-gray-900 dark:text-gray-100">LearnFlow Pro</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">版本：</span>
            <span className="text-gray-900 dark:text-gray-100">3.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">数据存储：</span>
            <span className="text-gray-900 dark:text-gray-100">本地存储</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">最后更新：</span>
            <span className="text-gray-900 dark:text-gray-100">2025-06-18</span>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
        
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>• <strong>今日概览</strong>：查看今日任务统计和进度</p>
          <p>• <strong>任务池</strong>：管理所有预设任务，可添加、编辑、删除任务</p>
          <p>• <strong>今日计划</strong>：专注管理今日选定的任务</p>
          <p>• <strong>数据导出</strong>：定期备份您的任务数据</p>
          <p>• <strong>智能筛选</strong>：支持按分类、优先级、状态筛选任务</p>
          <p>• <strong>本地存储</strong>：数据安全存储在本地，保护隐私</p>
        </div>
      </div>

      {/* 导入确认对话框 */}
      <AlertDialog open={isImportAlertOpen} onOpenChange={setIsImportAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认导入数据？</AlertDialogTitle>
            <AlertDialogDescription>
              这将使用文件中的数据替换当前所有的任务。此操作不可撤销。
              您确定要导入 {tasksToImport?.length || 0} 个新任务吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTasksToImport(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport} className="bg-green-600 hover:bg-green-700">
              确认导入
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 清空确认对话框 */}
      <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>您确定要清空所有数据吗？</AlertDialogTitle>
            <AlertDialogDescription>
              这将永久删除您的所有任务数据。此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClear} className="bg-red-600 hover:bg-red-700">
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsPage;
