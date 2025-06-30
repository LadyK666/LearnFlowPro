import axios from 'axios';
import { SimpleTokenManager } from './simpleTokenManager.js';

interface Task {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  isToday: boolean;
}

interface TaskStatistics {
  total: number;
  completed: number;
  completionRate: number;
  categories: Record<string, number>;
}

export class TaskManager {
  private apiUrl: string;
  private tokenManager: SimpleTokenManager;

  constructor() {
    this.apiUrl = 'http://localhost:4000/api';
    this.tokenManager = new SimpleTokenManager();
  }

  private async makeRequest(method: string, endpoint: string, data?: any) {
    try {
      // 从文件获取Token
      const token = this.tokenManager.getToken();
      
      const response = await axios({
        method,
        url: `${this.apiUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error: any) {
      // 如果是401错误，提示用户更新Token
      if (error.response?.status === 401) {
        console.log('Token已过期，请运行以下命令更新Token:');
        console.log('node quick-token.js "你的新token"');
        throw new Error('Token已过期，请更新Token后重试');
      }
      
      throw new Error(`API request failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async listTasks(filters: any = {}) {
    const { category, priority, completed, isToday, limit } = filters;
    
    let tasks = await this.makeRequest('GET', '/tasks');
    
    // 应用筛选
    if (category) {
      tasks = tasks.filter((task: Task) => task.category === category);
    }
    if (priority !== undefined) {
      tasks = tasks.filter((task: Task) => task.priority === priority);
    }
    if (completed !== undefined) {
      tasks = tasks.filter((task: Task) => task.completed === completed);
    }
    if (isToday !== undefined) {
      tasks = tasks.filter((task: Task) => task.isToday === isToday);
    }
    if (limit) {
      tasks = tasks.slice(0, limit);
    }

    return {
      content: [
        {
          type: 'text',
          text: `找到 ${tasks.length} 个任务：\n\n${tasks.map((task: Task) => 
            `ID: ${task.id}\n标题: ${task.title}\n类别: ${task.category}\n优先级: ${task.priority}\n完成状态: ${task.completed ? '已完成' : '未完成'}\n今日任务: ${task.isToday ? '是' : '否'}\n${task.description ? `描述: ${task.description}\n` : ''}---`
          ).join('\n')}`
        }
      ]
    };
  }

  async getTask(args: any) {
    const { taskId } = args;
    const task = await this.makeRequest('GET', `/tasks/${taskId}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `任务详情：\nID: ${task.id}\n标题: ${task.title}\n类别: ${task.category}\n优先级: ${task.priority}\n完成状态: ${task.completed ? '已完成' : '未完成'}\n今日任务: ${task.isToday ? '是' : '否'}\n创建时间: ${task.createdAt}\n${task.description ? `描述: ${task.description}\n` : ''}${task.completedAt ? `完成时间: ${task.completedAt}\n` : ''}`
        }
      ]
    };
  }

  async createTask(args: any) {
    const { title, description, category, priority, isToday = false } = args;
    
    const taskData = {
      title,
      description: description || '',
      category,
      priority,
      isToday,
    };

    const newTask = await this.makeRequest('POST', '/tasks', taskData);
    
    return {
      content: [
        {
          type: 'text',
          text: `任务创建成功！\nID: ${newTask.id}\n标题: ${newTask.title}\n类别: ${newTask.category}\n优先级: ${newTask.priority}\n今日任务: ${newTask.isToday ? '是' : '否'}`
        }
      ]
    };
  }

  async updateTask(args: any) {
    const { taskId, ...updateData } = args;
    
    const updatedTask = await this.makeRequest('PUT', `/tasks/${taskId}`, updateData);
    
    return {
      content: [
        {
          type: 'text',
          text: `任务更新成功！\nID: ${updatedTask.id}\n标题: ${updatedTask.title}\n类别: ${updatedTask.category}\n优先级: ${updatedTask.priority}\n完成状态: ${updatedTask.completed ? '已完成' : '未完成'}\n今日任务: ${updatedTask.isToday ? '是' : '否'}`
        }
      ]
    };
  }

  async deleteTask(args: any) {
    const { taskId } = args;
    
    await this.makeRequest('DELETE', `/tasks/${taskId}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `任务 ID ${taskId} 已成功删除。`
        }
      ]
    };
  }

  async toggleTaskCompletion(args: any) {
    const { taskId } = args;
    
    // 先获取当前任务状态
    const currentTask = await this.makeRequest('GET', `/tasks/${taskId}`);
    
    // 切换完成状态
    const updatedTask = await this.makeRequest('PUT', `/tasks/${taskId}`, {
      completed: !currentTask.completed,
      completedAt: !currentTask.completed ? new Date().toISOString() : null,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `任务完成状态已切换！\nID: ${updatedTask.id}\n标题: ${updatedTask.title}\n完成状态: ${updatedTask.completed ? '已完成' : '未完成'}`
        }
      ]
    };
  }

  async getTaskStatistics(args: any = {}) {
    const { isToday } = args;
    
    let tasks = await this.makeRequest('GET', '/tasks');
    
    if (isToday !== undefined) {
      tasks = tasks.filter((task: Task) => task.isToday === isToday);
    }
    
    const completed = tasks.filter((task: Task) => task.completed).length;
    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // 统计各类别数量
    const categories: Record<string, number> = {};
    tasks.forEach((task: Task) => {
      categories[task.category] = (categories[task.category] || 0) + 1;
    });
    
    const stats: TaskStatistics = {
      total,
      completed,
      completionRate,
      categories,
    };
    
    const categoryText = Object.entries(stats.categories)
      .map(([category, count]) => `${category}: ${count}个`)
      .join(', ');
    
    return {
      content: [
        {
          type: 'text',
          text: `任务统计信息：\n总任务数: ${stats.total}\n已完成: ${stats.completed}\n完成率: ${stats.completionRate}%\n类别分布: ${categoryText}`
        }
      ]
    };
  }
} 