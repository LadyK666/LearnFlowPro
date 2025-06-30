import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { TaskManager } from './taskManager.js';
import dotenv from 'dotenv';

dotenv.config();

class MyDayMCPServer {
  private server: Server;
  private taskManager: TaskManager;

  constructor() {
    this.server = new Server(
      {
        name: 'my-day-mcp-server',
        version: '1.0.0',
        capabilities: {
          tools: {},
        },
      }
    );

    this.taskManager = new TaskManager();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 列出所有可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
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
        ] as Tool[],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_tasks':
            return await this.taskManager.listTasks(args);
          case 'get_task':
            return await this.taskManager.getTask(args);
          case 'create_task':
            return await this.taskManager.createTask(args);
          case 'update_task':
            return await this.taskManager.updateTask(args);
          case 'delete_task':
            return await this.taskManager.deleteTask(args);
          case 'toggle_task_completion':
            return await this.taskManager.toggleTaskCompletion(args);
          case 'get_task_statistics':
            return await this.taskManager.getTaskStatistics(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('My-Day MCP Server is running...');
  }
}

// 启动服务器
const server = new MyDayMCPServer();
server.run().catch(console.error); 