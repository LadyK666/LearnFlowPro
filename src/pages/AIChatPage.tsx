import React, { useState, useEffect } from 'react';
import { useAIChat } from '../contexts/AIChatContext';
import { useTasks } from '../contexts/TasksContext';
import { AIChatRequest, Task } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Trash2, Send, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import TaskConfirmationDialog from '../components/TaskConfirmationDialog';
import OptimizationDialog from '../components/OptimizationDialog';

const AIChatPage: React.FC = () => {
  const { chats, loading, error, sendMessage, loadChats, deleteChat, deleteAllChats, batchUpdateTasks, clearError } = useAIChat();
  const { fetchTasks } = useTasks();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('Qwen/Qwen2.5-7B-Instruct');
  const [pendingTask, setPendingTask] = useState<Task | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string | null>(null);
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [optimizationData, setOptimizationData] = useState<any>(null);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      toast.error('请输入消息内容');
      return;
    }

    const request: AIChatRequest = {
      prompt: inputMessage,
      model: selectedModel,
    };

    const result = await sendMessage(request);
    
    if (result) {
      // 根据tool类型处理不同的响应
      if (result.tool === 'createTask' && result.createdTask) {
        // 显示任务确认对话框
        setPendingTask(result.createdTask);
        setShowTaskDialog(true);
        toast.success('AI已创建任务，请确认是否采纳');
      } else if (result.tool === 'optimizeSchedule') {
        toast.success('日程优化完成！');
      } else if (result.tool === 'scheduleOptimization') {
        // 显示日程优化建议
        console.log('scheduleOptimization result:', result);
        setOptimizationSuggestions(result.chat.response);
        setOptimizationData(result.params);
        setShowOptimizationDialog(true);
        toast.success('日程优化建议已生成！');
      } else {
        toast.success('AI回复已生成');
      }
      
      setInputMessage('');
    }
  };

  const handleTaskAccepted = async (task: Task) => {
    // 任务被采纳，刷新任务列表
    await fetchTasks();
    setPendingTask(null);
    setShowTaskDialog(false);
  };

  const handleTaskRejected = async () => {
    // 任务被拒绝，刷新任务列表（任务已被删除）
    await fetchTasks();
    setPendingTask(null);
    setShowTaskDialog(false);
  };

  const handleApplyOptimization = async (taskUpdates: Array<{
    id: number;
    title?: string;
    description?: string;
    priority?: number;
    category?: string;
    isToday?: boolean;
  }>) => {
    try {
      const success = await batchUpdateTasks(taskUpdates);
      if (success) {
        // 刷新任务列表
        await fetchTasks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('应用优化失败:', error);
      return false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getToolDisplayName = (tool: string) => {
    const toolNames: Record<string, string> = {
      'createTask': '创建任务',
      'scheduleOptimization': '日程优化',
      'optimizeSchedule': '优化日程',
      'general': '一般对话'
    };
    return toolNames[tool] || tool;
  };

  const getToolColor = (tool: string) => {
    const colors: Record<string, string> = {
      'createTask': 'bg-green-100 text-green-800',
      'scheduleOptimization': 'bg-purple-100 text-purple-800',
      'optimizeSchedule': 'bg-blue-100 text-blue-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return colors[tool] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">AI 智能助手</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadChats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          {chats.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={deleteAllChats}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              清空记录
            </Button>
          )}
        </div>
      </div>

      {/* 模型选择 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          选择AI模型
        </label>
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          >
            <option value="Qwen/Qwen2.5-VL-72B-Instruct" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">Qwen2.5-VL-72B-Instruct (72B-VL)</option>
            <option value="Qwen/Qwen2.5-32B-Instruct" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">Qwen2.5-32B-Instruct (32B)</option>
            <option value="Qwen/Qwen2.5-8B-Instruct" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">Qwen2.5-8B-Instruct (8B)</option>
            <option value="Qwen/Qwen2.5-1.5B-Instruct" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">Qwen2.5-1.5B-Instruct (1.5B)</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            ▼
          </span>
        </div>
      </div>

      {/* 输入区域 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">发送消息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的问题，例如：'帮我创建一个学习任务' 或 '优化我的日程安排'"
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="px-6"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p>💡 提示：</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>说"帮我创建一个任务"来创建新任务</li>
              <li>说"优化我的日程"来获得日程优化建议</li>
              <li>支持自然语言对话，AI会自动识别您的需求</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 对话记录 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">对话记录</h2>
        {chats.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无对话记录</p>
              <p className="text-sm text-gray-400 mt-2">开始与AI助手对话吧！</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {chats.map((chat) => (
                <Card key={chat.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getToolColor(chat.tool || 'general')}>
                          {getToolDisplayName(chat.tool || 'general')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(chat.createdAt)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteChat(chat.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 用户消息 */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 mb-1">您</p>
                          <p className="text-blue-800 whitespace-pre-wrap">{chat.prompt}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI回复 */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900 mb-1">AI助手</p>
                          <div className="text-gray-800 whitespace-pre-wrap">
                            {chat.response}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 模型信息 */}
                    <div className="text-xs text-gray-400 border-t pt-2">
                      模型: {chat.model || '未知'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* 任务确认对话框 */}
      <TaskConfirmationDialog
        isOpen={showTaskDialog}
        onClose={() => setShowTaskDialog(false)}
        task={pendingTask}
        onTaskAccepted={handleTaskAccepted}
        onTaskRejected={handleTaskRejected}
      />

      {/* 优化建议对话框 */}
      <OptimizationDialog
        isOpen={showOptimizationDialog}
        onClose={() => setShowOptimizationDialog(false)}
        suggestions={optimizationSuggestions}
        optimizationData={optimizationData}
        onApplyOptimization={handleApplyOptimization}
      />
    </div>
  );
};

export default AIChatPage;