import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/contexts/AIChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Plus, MessageSquare } from 'lucide-react';
import ChatMessage from './ChatMessage';

interface AIChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({ isOpen, onClose }) => {
  const {
    chats,
    loading,
    error,
    sendMessage,
    clearError,
  } = useAIChat();

  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('Qwen/Qwen2.5-7B-Instruct');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // 聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage({ prompt: message, model: selectedModel });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI助手
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                关闭
              </Button>
            </div>
          </div>
          
          {/* 模型选择 */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              选择模型
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 pr-8 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              >
                <option value="Qwen/Qwen2.5-VL-72B-Instruct" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">Qwen2.5-VL-72B-Instruct (72B-VL)</option>
                <option value="Qwen/Qwen2.5-32B-Instruct" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">Qwen2.5-32B-Instruct (32B)</option>
                <option value="Qwen/Qwen2.5-8B-Instruct" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">Qwen2.5-8B-Instruct (8B)</option>
                <option value="Qwen/Qwen2.5-1.5B-Instruct" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">Qwen2.5-1.5B-Instruct (1.5B)</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">
                ▼
              </span>
            </div>
          </div>
        </CardHeader>

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col">
          {/* 消息列表 */}
          <ScrollArea className="flex-1 p-4">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  欢迎使用AI助手
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  我可以帮助您管理任务、制定计划、提供建议等。请告诉我您需要什么帮助？
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {chats.slice(0, 10).map((chat) => (
                  <div key={chat.id} className="space-y-2">
                    {/* 用户消息 */}
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs lg:max-w-md">
                        <p className="text-sm">{chat.prompt}</p>
                      </div>
                    </div>
                    
                    {/* AI回复 */}
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-w-xs lg:max-w-md">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{chat.response}</p>
                        <p className="text-xs text-gray-500 mt-2">模型: {chat.model}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        <span className="text-sm text-gray-500">AI正在思考...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* 错误提示 */}
          {error && (
            <div className="px-4 pb-4">
              <Alert variant="destructive">
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="h-auto p-1"
                  >
                    ✕
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* 输入区域 */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                className="flex-1"
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIChatDialog; 