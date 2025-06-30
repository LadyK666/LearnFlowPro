export declare class TaskManager {
    private apiUrl;
    private tokenManager;
    constructor();
    private makeRequest;
    listTasks(filters?: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    getTask(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    createTask(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    updateTask(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    deleteTask(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    toggleTaskCompletion(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    getTaskStatistics(args?: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
}
//# sourceMappingURL=taskManager.d.ts.map