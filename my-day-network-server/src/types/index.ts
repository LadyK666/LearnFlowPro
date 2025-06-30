// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 任务类型
export interface Task {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: number;
  completed: boolean;
  isToday: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  todayOrder?: number;
  authorId: number;
}

// 工具调用参数类型
export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

// 批量工具调用类型
export interface BatchToolCall {
  calls: ToolCall[];
}

// 工具定义类型
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

// 服务器状态类型
export interface ServerStatus {
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
  uptime: number;
  version: string;
}

// WebSocket 消息类型
export interface WebSocketMessage {
  type: 'call' | 'ping' | 'pong';
  name?: string;
  arguments?: Record<string, any>;
  timestamp?: number;
}

// WebSocket 响应类型
export interface WebSocketResponse {
  success: boolean;
  result?: any;
  error?: string;
  type?: string;
  timestamp?: number;
  message?: string;
} 