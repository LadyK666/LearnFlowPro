import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { AIChat, AIChatRequest } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface AIChatContextType {
  chats: AIChat[];
  loading: boolean;
  error: string | null;
  sendMessage: (request: AIChatRequest) => Promise<{ chat: AIChat; tool: string; params: any; createdTask?: any; optimizedTasks?: any } | null>;
  loadChats: () => Promise<void>;
  deleteChat: (id: number) => Promise<void>;
  deleteAllChats: () => Promise<void>;
  batchUpdateTasks: (taskUpdates: Array<{ id: number; title?: string; description?: string; priority?: number; category?: string; isToday?: boolean; reason?: string }>) => Promise<boolean>;
  clearError: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
};

interface AIChatProviderProps {
  children: React.ReactNode;
}

export const AIChatProvider: React.FC<AIChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<AIChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }

      const response = await axios.get(`${API_URL}/ai/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 确保返回的数据是数组
      const data = response.data;
      if (Array.isArray(data)) {
        setChats(data);
      } else {
        console.error('API返回的数据不是数组:', data);
        setChats([]);
        setError('数据格式错误');
      }
    } catch (err: any) {
      console.error('加载AI对话记录失败:', err);
      setChats([]); // 确保chats始终是数组
      setError(err.response?.data?.error || '加载AI对话记录失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (request: AIChatRequest): Promise<{ chat: AIChat; tool: string; params: any; createdTask?: any; optimizedTasks?: any } | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }

      const response = await axios.post(`${API_URL}/ai/chat`, request, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = response.data;
      if (result && result.chat && typeof result.chat === 'object') {
        setChats(prev => [result.chat, ...prev]);
        return {
          chat: result.chat,
          tool: result.tool || 'general',
          params: result.params || null,
          createdTask: result.createdTask || null,
          optimizedTasks: result.optimizedTasks || null
        };
      } else {
        throw new Error('返回的数据格式错误');
      }
    } catch (err: any) {
      console.error('发送消息失败:', err);
      setError(err.response?.data?.error || '发送消息失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteChat = useCallback(async (id: number) => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }

      await axios.delete(`${API_URL}/ai/chats/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChats(prev => prev.filter(chat => chat.id !== id));
    } catch (err: any) {
      console.error('删除对话记录失败:', err);
      setError(err.response?.data?.error || '删除对话记录失败');
    }
  }, []);

  const deleteAllChats = useCallback(async () => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }

      await axios.delete(`${API_URL}/ai/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChats([]);
    } catch (err: any) {
      console.error('删除所有对话记录失败:', err);
      setError(err.response?.data?.error || '删除所有对话记录失败');
    }
  }, []);

  const batchUpdateTasks = useCallback(async (taskUpdates: Array<{ id: number; title?: string; description?: string; priority?: number; category?: string; isToday?: boolean; reason?: string }>): Promise<boolean> => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }

      const response = await axios.post(`${API_URL}/ai/tasks/batch-update`, { taskUpdates }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data.success;
    } catch (err: any) {
      console.error('批量更新任务失败:', err);
      setError(err.response?.data?.error || '批量更新任务失败');
      return false;
    }
  }, []);

  const value: AIChatContextType = {
    chats,
    loading,
    error,
    sendMessage,
    loadChats,
    deleteChat,
    deleteAllChats,
    batchUpdateTasks,
    clearError,
  };

  return (
    <AIChatContext.Provider value={value}>
      {children}
    </AIChatContext.Provider>
  );
}; 