import { ToolCall, ApiResponse } from '../types/index.js';
export declare class ToolController {
    private taskService;
    constructor();
    handleToolCall(toolCall: ToolCall): Promise<ApiResponse>;
    private handleListTasks;
    private handleGetTask;
    private handleCreateTask;
    private handleUpdateTask;
    private handleDeleteTask;
    private handleToggleTaskCompletion;
    private handleGetTaskStatistics;
    getAvailableTools(): ({
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                category: {
                    type: string;
                    description: string;
                };
                priority: {
                    type: string;
                    description: string;
                };
                completed: {
                    type: string;
                    description: string;
                };
                isToday: {
                    type: string;
                    description: string;
                };
                limit: {
                    type: string;
                    description: string;
                };
                taskId?: undefined;
                title?: undefined;
                description?: undefined;
            };
            required?: undefined;
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                taskId: {
                    type: string;
                    description: string;
                };
                category?: undefined;
                priority?: undefined;
                completed?: undefined;
                isToday?: undefined;
                limit?: undefined;
                title?: undefined;
                description?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                title: {
                    type: string;
                    description: string;
                };
                description: {
                    type: string;
                    description: string;
                };
                category: {
                    type: string;
                    description: string;
                };
                priority: {
                    type: string;
                    description: string;
                };
                isToday: {
                    type: string;
                    description: string;
                };
                completed?: undefined;
                limit?: undefined;
                taskId?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                taskId: {
                    type: string;
                    description: string;
                };
                title: {
                    type: string;
                    description: string;
                };
                description: {
                    type: string;
                    description: string;
                };
                category: {
                    type: string;
                    description: string;
                };
                priority: {
                    type: string;
                    description: string;
                };
                isToday: {
                    type: string;
                    description: string;
                };
                completed: {
                    type: string;
                    description: string;
                };
                limit?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                isToday: {
                    type: string;
                    description: string;
                };
                category?: undefined;
                priority?: undefined;
                completed?: undefined;
                limit?: undefined;
                taskId?: undefined;
                title?: undefined;
                description?: undefined;
            };
            required?: undefined;
        };
    })[];
    getTokenInfo(): {
        token: string;
        isValid: boolean;
        path: string;
    };
}
//# sourceMappingURL=ToolController.d.ts.map