import axios, { AxiosInstance } from 'axios';
import { Task, ApiResponse } from '../types/index.js';
import { TokenManager } from '../utils/TokenManager.js';

export class TaskService {
  private api: AxiosInstance;
  private tokenManager: TokenManager;

  constructor() {
    this.tokenManager = new TokenManager();
    this.api = axios.create({
      baseURL: process.env.API_URL || 'http://localhost:4000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        const token = this.tokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API请求错误:', error.response?.data || error.message);
        
        // 如果是401错误，提示用户更新Token
        if (error.response?.status === 401) {
          console.log('❌ Token已过期，请更新Token');
          console.log('💡 运行以下命令更新Token:');
          console.log('   node scripts/set-token.js "你的新token"');
        }
        
        return Promise.reject(error);
      }
    );

    // 监听Token文件变化
    this.tokenManager.watchTokenFile((newToken) => {
      console.log('🔄 Token已更新，重新配置API客户端');
      this.api.defaults.headers.Authorization = `Bearer ${newToken}`;
    });
  }

  // 获取所有任务
  async listTasks(filters: {
    category?: string;
    priority?: string;
    completed?: boolean;
    isToday?: boolean;
    limit?: number;
  } = {}): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.completed !== undefined) params.append('completed', filters.completed.toString());
      if (filters.isToday !== undefined) params.append('isToday', filters.isToday.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await this.api.get(`/tasks?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('获取任务列表失败:', error);
      throw new Error('获取任务列表失败');
    }
  }

  // 获取单个任务
  async getTask(taskId: number): Promise<Task> {
    try {
      const response = await this.api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('获取任务详情失败:', error);
      throw new Error('获取任务详情失败');
    }
  }

  // 创建任务
  async createTask(taskData: {
    title: string;
    description?: string;
    category: string;
    priority: number;
    isToday?: boolean;
  }): Promise<Task> {
    try {
      const response = await this.api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw new Error('创建任务失败');
    }
  }

  // 更新任务
  async updateTask(taskId: number, updates: {
    title?: string;
    description?: string;
    category?: string;
    priority?: number;
    isToday?: boolean;
    completed?: boolean;
    completedAt?: string;
  }): Promise<Task> {
    try {
      const response = await this.api.put(`/tasks/${taskId}`, updates);
      return response.data;
    } catch (error) {
      console.error('更新任务失败:', error);
      throw new Error('更新任务失败');
    }
  }

  // 删除任务
  async deleteTask(taskId: number): Promise<void> {
    try {
      await this.api.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error('删除任务失败:', error);
      throw new Error('删除任务失败');
    }
  }

  // 切换任务完成状态
  async toggleTaskCompletion(taskId: number): Promise<Task> {
    try {
      // 先获取当前任务状态
      const task = await this.getTask(taskId);
      const newCompletedState = !task.completed;
      
      // 更新完成状态
      return await this.updateTask(taskId, { 
        completed: newCompletedState,
        completedAt: newCompletedState ? new Date().toISOString() : undefined
      });
    } catch (error) {
      console.error('切换任务完成状态失败:', error);
      throw new Error('切换任务完成状态失败');
    }
  }

  // 获取任务统计
  async getTaskStatistics(filters: { isToday?: boolean } = {}): Promise<{
    total: number;
    completed: number;
    pending: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const tasks = await this.listTasks(filters);
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length,
        byCategory: {} as Record<string, number>,
        byPriority: {} as Record<string, number>
      };

      // 按类别统计
      tasks.forEach(task => {
        stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1;
      });

      // 按优先级统计
      tasks.forEach(task => {
        const priorityLabel = this.getPriorityLabel(task.priority);
        stats.byPriority[priorityLabel] = (stats.byPriority[priorityLabel] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('获取任务统计失败:', error);
      throw new Error('获取任务统计失败');
    }
  }

  // 获取优先级标签
  private getPriorityLabel(priority: number): string {
    switch (priority) {
      case 0: return 'low';
      case 1: return 'medium';
      case 2: return 'high';
      case 3: return 'urgent';
      default: return 'unknown';
    }
  }

  // 验证API连接
  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/tasks');
      return true;
    } catch (error) {
      console.error('API连接测试失败:', error);
      return false;
    }
  }

  // 获取当前Token信息
  getTokenInfo(): { token: string; isValid: boolean; path: string } {
    const token = this.tokenManager.getToken();
    return {
      token: token.substring(0, 20) + '...', // 只显示前20个字符
      isValid: this.tokenManager.isTokenValid(token),
      path: this.tokenManager.getTokenPath()
    };
  }
} 