import { Task } from '../types/index.js';
export declare class TaskService {
    private api;
    private tokenManager;
    constructor();
    listTasks(filters?: {
        category?: string;
        priority?: string;
        completed?: boolean;
        isToday?: boolean;
        limit?: number;
    }): Promise<Task[]>;
    getTask(taskId: number): Promise<Task>;
    createTask(taskData: {
        title: string;
        description?: string;
        category: string;
        priority: number;
        isToday?: boolean;
    }): Promise<Task>;
    updateTask(taskId: number, updates: {
        title?: string;
        description?: string;
        category?: string;
        priority?: number;
        isToday?: boolean;
        completed?: boolean;
        completedAt?: string;
    }): Promise<Task>;
    deleteTask(taskId: number): Promise<void>;
    toggleTaskCompletion(taskId: number): Promise<Task>;
    getTaskStatistics(filters?: {
        isToday?: boolean;
    }): Promise<{
        total: number;
        completed: number;
        pending: number;
        byCategory: Record<string, number>;
        byPriority: Record<string, number>;
    }>;
    private getPriorityLabel;
    testConnection(): Promise<boolean>;
    getTokenInfo(): {
        token: string;
        isValid: boolean;
        path: string;
    };
}
//# sourceMappingURL=TaskService.d.ts.map