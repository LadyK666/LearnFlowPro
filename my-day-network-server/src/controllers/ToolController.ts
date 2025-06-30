import { TaskService } from '../services/TaskService.js';
import { ToolCall, ApiResponse } from '../types/index.js';

export class ToolController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  // 处理工具调用
  async handleToolCall(toolCall: ToolCall): Promise<ApiResponse> {
    try {
      const { name, arguments: args } = toolCall;

      switch (name) {
        case 'list_tasks':
          return await this.handleListTasks(args);
        case 'get_task':
          return await this.handleGetTask(args);
        case 'create_task':
          return await this.handleCreateTask(args);
        case 'update_task':
          return await this.handleUpdateTask(args);
        case 'delete_task':
          return await this.handleDeleteTask(args);
        case 'toggle_task_completion':
          return await this.handleToggleTaskCompletion(args);
        case 'get_task_statistics':
          return await this.handleGetTaskStatistics(args);
        default:
          return {
            success: false,
            error: `未知工具: ${name}`
          };
      }
    } catch (error) {
      console.error('工具调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 处理获取任务列表
  private async handleListTasks(args: any): Promise<ApiResponse> {
    try {
      const tasks = await this.taskService.listTasks(args);
      
      const taskList = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        completed: task.completed,
        isToday: task.isToday,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt
      }));

      return {
        success: true,
        data: {
          tasks: taskList,
          count: taskList.length,
          message: `找到 ${taskList.length} 个任务`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取任务列表失败'
      };
    }
  }

  // 处理获取单个任务
  private async handleGetTask(args: any): Promise<ApiResponse> {
    try {
      const { taskId } = args;
      
      if (!taskId) {
        return {
          success: false,
          error: '任务ID是必需的'
        };
      }

      const task = await this.taskService.getTask(Number(taskId));
      
      return {
        success: true,
        data: {
          task,
          message: `成功获取任务: ${task.title}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取任务详情失败'
      };
    }
  }

  // 处理创建任务
  private async handleCreateTask(args: any): Promise<ApiResponse> {
    try {
      const { title, description, category, priority, isToday } = args;
      
      if (!title || !category || priority === undefined) {
        return {
          success: false,
          error: '标题、类别和优先级是必需的'
        };
      }

      const task = await this.taskService.createTask({
        title,
        description,
        category,
        priority: Number(priority),
        isToday: isToday || false
      });
      
      return {
        success: true,
        data: {
          task,
          message: `成功创建任务: ${task.title}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建任务失败'
      };
    }
  }

  // 处理更新任务
  private async handleUpdateTask(args: any): Promise<ApiResponse> {
    try {
      const { taskId, ...updates } = args;
      
      if (!taskId) {
        return {
          success: false,
          error: '任务ID是必需的'
        };
      }

      const task = await this.taskService.updateTask(Number(taskId), updates);
      
      return {
        success: true,
        data: {
          task,
          message: `成功更新任务: ${task.title}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新任务失败'
      };
    }
  }

  // 处理删除任务
  private async handleDeleteTask(args: any): Promise<ApiResponse> {
    try {
      const { taskId } = args;
      
      if (!taskId) {
        return {
          success: false,
          error: '任务ID是必需的'
        };
      }

      await this.taskService.deleteTask(Number(taskId));
      
      return {
        success: true,
        data: {
          message: `成功删除任务 ID: ${taskId}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除任务失败'
      };
    }
  }

  // 处理切换任务完成状态
  private async handleToggleTaskCompletion(args: any): Promise<ApiResponse> {
    try {
      const { taskId } = args;
      
      if (!taskId) {
        return {
          success: false,
          error: '任务ID是必需的'
        };
      }

      const task = await this.taskService.toggleTaskCompletion(Number(taskId));
      
      return {
        success: true,
        data: {
          task,
          message: `任务 "${task.title}" 已${task.completed ? '完成' : '标记为未完成'}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '切换任务完成状态失败'
      };
    }
  }

  // 处理获取任务统计
  private async handleGetTaskStatistics(args: any): Promise<ApiResponse> {
    try {
      const { isToday } = args;
      
      const stats = await this.taskService.getTaskStatistics({ isToday });
      
      return {
        success: true,
        data: {
          statistics: stats,
          message: `任务统计信息${isToday ? '（今日）' : '（全部）'}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取任务统计失败'
      };
    }
  }

  // 获取可用工具列表
  getAvailableTools() {
    return [
      {
        name: 'list_tasks',
        description: '获取所有任务列表，支持按类别、优先级、完成状态筛选',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: '任务类别筛选（可选）：work, personal, health, learning, shopping, other',
            },
            priority: {
              type: 'string',
              description: '优先级筛选（可选）：low, medium, high, urgent',
            },
            completed: {
              type: 'boolean',
              description: '完成状态筛选（可选）：true表示已完成，false表示未完成',
            },
            isToday: {
              type: 'boolean',
              description: '今日任务筛选（可选）：true表示今日任务，false表示非今日任务',
            },
            limit: {
              type: 'number',
              description: '返回任务数量限制（可选）',
            },
          },
        },
      },
      {
        name: 'get_task',
        description: '根据任务ID获取单个任务的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'number',
              description: '任务ID',
            },
          },
          required: ['taskId'],
        },
      },
      {
        name: 'create_task',
        description: '创建新任务',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: '任务标题',
            },
            description: {
              type: 'string',
              description: '任务描述（可选）',
            },
            category: {
              type: 'string',
              description: '任务类别：work, personal, health, learning, shopping, other',
            },
            priority: {
              type: 'number',
              description: '优先级：0(低), 1(中), 2(高), 3(紧急)',
            },
            isToday: {
              type: 'boolean',
              description: '是否为今日任务',
            },
          },
          required: ['title', 'category', 'priority'],
        },
      },
      {
        name: 'update_task',
        description: '更新任务信息',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'number',
              description: '任务ID',
            },
            title: {
              type: 'string',
              description: '任务标题（可选）',
            },
            description: {
              type: 'string',
              description: '任务描述（可选）',
            },
            category: {
              type: 'string',
              description: '任务类别（可选）：work, personal, health, learning, shopping, other',
            },
            priority: {
              type: 'number',
              description: '优先级（可选）：0(低), 1(中), 2(高), 3(紧急)',
            },
            isToday: {
              type: 'boolean',
              description: '是否为今日任务（可选）',
            },
            completed: {
              type: 'boolean',
              description: '完成状态（可选）',
            },
          },
          required: ['taskId'],
        },
      },
      {
        name: 'delete_task',
        description: '删除任务',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'number',
              description: '任务ID',
            },
          },
          required: ['taskId'],
        },
      },
      {
        name: 'toggle_task_completion',
        description: '切换任务完成状态',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'number',
              description: '任务ID',
            },
          },
          required: ['taskId'],
        },
      },
      {
        name: 'get_task_statistics',
        description: '获取任务统计信息',
        inputSchema: {
          type: 'object',
          properties: {
            isToday: {
              type: 'boolean',
              description: '是否只统计今日任务（可选）',
            },
          },
        },
      },
    ];
  }

  // 获取Token信息
  getTokenInfo() {
    return this.taskService.getTokenInfo();
  }
} 