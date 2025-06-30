export interface Task {
  id: number;
  title: string;
  description?: string;
  category: TaskCategory | string;
  priority: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  isToday: boolean;
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  HEALTH = 'health',
  LEARNING = 'learning',
  SHOPPING = 'shopping',
  OTHER = 'other'
}

export enum Priority {
  LOW,
  MEDIUM,
  HIGH,
  URGENT
}

export interface TaskFilter {
  category?: TaskCategory | string;
  priority?: Priority;
  completed?: boolean;
  search?: string;
}

export interface DayStats {
  total: number;
  completed: number;
  completionRate: number;
  categories: Record<TaskCategory | string, number>;
}

export interface User {
  id: number;
  email: string;
  name?: string | null;
}

export interface SortConfig {
  sortBy: 'createdAt' | 'priority' | 'title';
  order: 'asc' | 'desc';
}

// AI聊天相关类型
export interface AIChat {
  id: number;
  prompt: string;
  response: string;
  model: string;
  tool: string;
  finish: boolean;
  createdAt: string;
  authorId: number;
}

export interface AIChatRequest {
  prompt: string;
  model?: string;
  tool?: string;
}

export interface AIChatResponse {
  id: number;
  prompt: string;
  response: string;
  model: string;
  tool: string;
  finish: boolean;
  createdAt: string;
  authorId: number;
}
