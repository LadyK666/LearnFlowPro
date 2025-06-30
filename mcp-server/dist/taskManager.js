import axios from 'axios';
import { SimpleTokenManager } from './simpleTokenManager.js';
export class TaskManager {
    apiUrl;
    tokenManager;
    constructor() {
        this.apiUrl = 'http://localhost:4000/api';
        this.tokenManager = new SimpleTokenManager();
    }
    async makeRequest(method, endpoint, data) {
        try {
            // ���ļ���ȡToken
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
        }
        catch (error) {
            // �����401������ʾ�û�����Token
            if (error.response?.status === 401) {
                console.log('Token�ѹ��ڣ������������������Token:');
                console.log('node quick-token.js "�����token"');
                throw new Error('Token�ѹ��ڣ������Token������');
            }
            throw new Error(`API request failed: ${error.response?.data?.error || error.message}`);
        }
    }
    async listTasks(filters = {}) {
        const { category, priority, completed, isToday, limit } = filters;
        let tasks = await this.makeRequest('GET', '/tasks');
        // Ӧ��ɸѡ
        if (category) {
            tasks = tasks.filter((task) => task.category === category);
        }
        if (priority !== undefined) {
            tasks = tasks.filter((task) => task.priority === priority);
        }
        if (completed !== undefined) {
            tasks = tasks.filter((task) => task.completed === completed);
        }
        if (isToday !== undefined) {
            tasks = tasks.filter((task) => task.isToday === isToday);
        }
        if (limit) {
            tasks = tasks.slice(0, limit);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: `�ҵ� ${tasks.length} ������\n\n${tasks.map((task) => `ID: ${task.id}\n����: ${task.title}\n���: ${task.category}\n���ȼ�: ${task.priority}\n���״̬: ${task.completed ? '�����' : 'δ���'}\n��������: ${task.isToday ? '��' : '��'}\n${task.description ? `����: ${task.description}\n` : ''}---`).join('\n')}`
                }
            ]
        };
    }
    async getTask(args) {
        const { taskId } = args;
        const task = await this.makeRequest('GET', `/tasks/${taskId}`);
        return {
            content: [
                {
                    type: 'text',
                    text: `�������飺\nID: ${task.id}\n����: ${task.title}\n���: ${task.category}\n���ȼ�: ${task.priority}\n���״̬: ${task.completed ? '�����' : 'δ���'}\n��������: ${task.isToday ? '��' : '��'}\n����ʱ��: ${task.createdAt}\n${task.description ? `����: ${task.description}\n` : ''}${task.completedAt ? `���ʱ��: ${task.completedAt}\n` : ''}`
                }
            ]
        };
    }
    async createTask(args) {
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
                    text: `���񴴽��ɹ���\nID: ${newTask.id}\n����: ${newTask.title}\n���: ${newTask.category}\n���ȼ�: ${newTask.priority}\n��������: ${newTask.isToday ? '��' : '��'}`
                }
            ]
        };
    }
    async updateTask(args) {
        const { taskId, ...updateData } = args;
        const updatedTask = await this.makeRequest('PUT', `/tasks/${taskId}`, updateData);
        return {
            content: [
                {
                    type: 'text',
                    text: `������³ɹ���\nID: ${updatedTask.id}\n����: ${updatedTask.title}\n���: ${updatedTask.category}\n���ȼ�: ${updatedTask.priority}\n���״̬: ${updatedTask.completed ? '�����' : 'δ���'}\n��������: ${updatedTask.isToday ? '��' : '��'}`
                }
            ]
        };
    }
    async deleteTask(args) {
        const { taskId } = args;
        await this.makeRequest('DELETE', `/tasks/${taskId}`);
        return {
            content: [
                {
                    type: 'text',
                    text: `���� ID ${taskId} �ѳɹ�ɾ����`
                }
            ]
        };
    }
    async toggleTaskCompletion(args) {
        const { taskId } = args;
        // �Ȼ�ȡ��ǰ����״̬
        const currentTask = await this.makeRequest('GET', `/tasks/${taskId}`);
        // �л����״̬
        const updatedTask = await this.makeRequest('PUT', `/tasks/${taskId}`, {
            completed: !currentTask.completed,
            completedAt: !currentTask.completed ? new Date().toISOString() : null,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `�������״̬���л���\nID: ${updatedTask.id}\n����: ${updatedTask.title}\n���״̬: ${updatedTask.completed ? '�����' : 'δ���'}`
                }
            ]
        };
    }
    async getTaskStatistics(args = {}) {
        const { isToday } = args;
        let tasks = await this.makeRequest('GET', '/tasks');
        if (isToday !== undefined) {
            tasks = tasks.filter((task) => task.isToday === isToday);
        }
        const completed = tasks.filter((task) => task.completed).length;
        const total = tasks.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        // ͳ�Ƹ��������
        const categories = {};
        tasks.forEach((task) => {
            categories[task.category] = (categories[task.category] || 0) + 1;
        });
        const stats = {
            total,
            completed,
            completionRate,
            categories,
        };
        const categoryText = Object.entries(stats.categories)
            .map(([category, count]) => `${category}: ${count}��`)
            .join(', ');
        return {
            content: [
                {
                    type: 'text',
                    text: `����ͳ����Ϣ��\n��������: ${stats.total}\n�����: ${stats.completed}\n�����: ${stats.completionRate}%\n���ֲ�: ${categoryText}`
                }
            ]
        };
    }
}
//# sourceMappingURL=taskManager.js.map