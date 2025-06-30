import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { TaskManager } from './taskManager.js';
import dotenv from 'dotenv';
dotenv.config();
class MyDayMCPServer {
    server;
    taskManager;
    constructor() {
        this.server = new Server({
            name: 'my-day-mcp-server',
            version: '1.0.0',
            capabilities: {
                tools: {},
            },
        });
        this.taskManager = new TaskManager();
        this.setupToolHandlers();
    }
    setupToolHandlers() {
        // �г����п��ù���
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'list_tasks',
                        description: '��ȡ���������б���֧�ְ�������ȼ������״̬ɸѡ',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                category: {
                                    type: 'string',
                                    description: '�������ɸѡ����ѡ����work, personal, health, learning, shopping, other',
                                },
                                priority: {
                                    type: 'string',
                                    description: '���ȼ�ɸѡ����ѡ����low, medium, high, urgent',
                                },
                                completed: {
                                    type: 'boolean',
                                    description: '���״̬ɸѡ����ѡ����true��ʾ����ɣ�false��ʾδ���',
                                },
                                isToday: {
                                    type: 'boolean',
                                    description: '��������ɸѡ����ѡ����true��ʾ��������false��ʾ�ǽ�������',
                                },
                                limit: {
                                    type: 'number',
                                    description: '���������������ƣ���ѡ��',
                                },
                            },
                        },
                    },
                    {
                        name: 'get_task',
                        description: '��������ID��ȡ�����������ϸ��Ϣ',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                taskId: {
                                    type: 'number',
                                    description: '����ID',
                                },
                            },
                            required: ['taskId'],
                        },
                    },
                    {
                        name: 'create_task',
                        description: '����������',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                title: {
                                    type: 'string',
                                    description: '�������',
                                },
                                description: {
                                    type: 'string',
                                    description: '������������ѡ��',
                                },
                                category: {
                                    type: 'string',
                                    description: '�������work, personal, health, learning, shopping, other',
                                },
                                priority: {
                                    type: 'number',
                                    description: '���ȼ���0(��), 1(��), 2(��), 3(����)',
                                },
                                isToday: {
                                    type: 'boolean',
                                    description: '�Ƿ�Ϊ��������',
                                },
                            },
                            required: ['title', 'category', 'priority'],
                        },
                    },
                    {
                        name: 'update_task',
                        description: '����������Ϣ',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                taskId: {
                                    type: 'number',
                                    description: '����ID',
                                },
                                title: {
                                    type: 'string',
                                    description: '������⣨��ѡ��',
                                },
                                description: {
                                    type: 'string',
                                    description: '������������ѡ��',
                                },
                                category: {
                                    type: 'string',
                                    description: '������𣨿�ѡ����work, personal, health, learning, shopping, other',
                                },
                                priority: {
                                    type: 'number',
                                    description: '���ȼ�����ѡ����0(��), 1(��), 2(��), 3(����)',
                                },
                                isToday: {
                                    type: 'boolean',
                                    description: '�Ƿ�Ϊ�������񣨿�ѡ��',
                                },
                                completed: {
                                    type: 'boolean',
                                    description: '���״̬����ѡ��',
                                },
                            },
                            required: ['taskId'],
                        },
                    },
                    {
                        name: 'delete_task',
                        description: 'ɾ������',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                taskId: {
                                    type: 'number',
                                    description: '����ID',
                                },
                            },
                            required: ['taskId'],
                        },
                    },
                    {
                        name: 'toggle_task_completion',
                        description: '�л��������״̬',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                taskId: {
                                    type: 'number',
                                    description: '����ID',
                                },
                            },
                            required: ['taskId'],
                        },
                    },
                    {
                        name: 'get_task_statistics',
                        description: '��ȡ����ͳ����Ϣ',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                isToday: {
                                    type: 'boolean',
                                    description: '�Ƿ�ֻͳ�ƽ������񣨿�ѡ��',
                                },
                            },
                        },
                    },
                ],
            };
        });
        // �������ߵ���
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
            }
            catch (error) {
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
// ����������
const server = new MyDayMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map