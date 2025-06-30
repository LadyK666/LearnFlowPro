import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { ToolController } from './controllers/ToolController.js';
import { ToolCall, BatchToolCall, WebSocketMessage, WebSocketResponse, ServerStatus } from './types/index.js';

dotenv.config();

class MyDayNetworkServer {
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocketServer;
  private toolController: ToolController;
  private port: number;
  private startTime: number;

  constructor() {
    this.port = parseInt(process.env.SERVER_PORT || '3001');
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.toolController = new ToolController();
    this.startTime = Date.now();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupMiddleware() {
    // 启用CORS
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    this.app.use(cors({
      origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // 请求日志中间件
    if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
      this.app.use((req: Request, res: Response, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  private setupRoutes() {
    // 健康检查端点
    this.app.get('/health', (req: Request, res: Response) => {
      const status: ServerStatus = {
        status: 'ok',
        message: 'My-Day Network Server is running',
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        version: '1.0.0'
      };
      res.json(status);
    });

    // Token信息端点
    this.app.get('/token-info', (req: Request, res: Response) => {
      try {
        const tokenInfo = this.toolController.getTokenInfo();
        res.json({
          success: true,
          data: tokenInfo,
          message: 'Token信息获取成功'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : '获取Token信息失败'
        });
      }
    });

    // 获取可用工具列表
    this.app.get('/tools', (req: Request, res: Response) => {
      try {
        const tools = this.toolController.getAvailableTools();
        res.json({
          success: true,
          data: { tools },
          message: `可用工具数量: ${tools.length}`
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : '获取工具列表失败'
        });
      }
    });

    // 工具调用端点
    this.app.post('/call', async (req: Request, res: Response) => {
      try {
        const { name, arguments: args } = req.body as ToolCall;

        if (!name) {
          return res.status(400).json({
            success: false,
            error: '工具名称是必需的'
          });
        }

        const result = await this.toolController.handleToolCall({ name, arguments: args });
        res.json(result);
      } catch (error) {
        console.error('工具调用错误:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : '工具调用失败'
        });
      }
    });

    // 批量工具调用端点
    this.app.post('/batch', async (req: Request, res: Response) => {
      try {
        const { calls } = req.body as BatchToolCall;

        if (!Array.isArray(calls)) {
          return res.status(400).json({
            success: false,
            error: 'calls必须是数组'
          });
        }

        const results = [];
        for (const call of calls) {
          try {
            const result = await this.toolController.handleToolCall(call);
            results.push(result);
          } catch (error) {
            results.push({
              success: false,
              error: error instanceof Error ? error.message : '未知错误'
            });
          }
        }

        res.json({
          success: true,
          data: { results },
          message: `批量调用完成，共 ${results.length} 个工具`
        });
      } catch (error) {
        console.error('批量调用错误:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : '批量调用失败'
        });
      }
    });

    // API文档端点
    this.app.get('/docs', (req: Request, res: Response) => {
      res.json({
        success: true,
        data: {
          title: 'My-Day Network Server API',
          version: '1.0.0',
          description: '支持远程AI访问的My-Day任务管理API',
          endpoints: {
            'GET /health': '健康检查',
            'GET /token-info': 'Token信息',
            'GET /tools': '获取可用工具列表',
            'POST /call': '调用单个工具',
            'POST /batch': '批量调用工具',
            'GET /docs': 'API文档'
          },
          websocket: {
            url: `ws://localhost:${this.port}`,
            messageTypes: ['call', 'ping'],
            responseTypes: ['success', 'error', 'pong']
          }
        }
      });
    });

    // 404处理
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: '端点不存在',
        availableEndpoints: [
          'GET /health',
          'GET /token-info',
          'GET /tools', 
          'POST /call',
          'POST /batch',
          'GET /docs'
        ]
      });
    });
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('新的WebSocket连接已建立');

      // 发送欢迎消息
      const welcomeMessage: WebSocketResponse = {
        success: true,
        message: 'WebSocket连接已建立',
        timestamp: Date.now()
      };
      ws.send(JSON.stringify(welcomeMessage));

      ws.on('message', async (message: Buffer) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.toString());
          const { type, name, arguments: args } = data;

          if (type === 'call') {
            if (!name) {
              ws.send(JSON.stringify({
                success: false,
                error: '工具名称是必需的',
                timestamp: Date.now()
              }));
              return;
            }

            const result = await this.toolController.handleToolCall({ 
              name, 
              arguments: args || {} 
            });
            const response: WebSocketResponse = {
              success: result.success,
              result: result.data,
              error: result.error,
              timestamp: Date.now()
            };
            ws.send(JSON.stringify(response));

          } else if (type === 'ping') {
            const response: WebSocketResponse = {
              success: true,
              type: 'pong',
              timestamp: Date.now()
            };
            ws.send(JSON.stringify(response));

          } else {
            ws.send(JSON.stringify({
              success: false,
              error: `未知消息类型: ${type}`,
              timestamp: Date.now()
            }));
          }
        } catch (error) {
          console.error('WebSocket消息处理错误:', error);
          ws.send(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : '消息处理失败',
            timestamp: Date.now()
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket连接已关闭');
      });

      ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
      });
    });
  }

  async start(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server.listen(this.port, () => {
        console.log('🚀 My-Day Network Server 启动成功!');
        console.log('');
        console.log('📡 服务器信息:');
        console.log(`   HTTP API: http://localhost:${this.port}`);
        console.log(`   WebSocket: ws://localhost:${this.port}`);
        console.log(`   健康检查: http://localhost:${this.port}/health`);
        console.log(`   API文档: http://localhost:${this.port}/docs`);
        console.log('');
        console.log('🔧 可用端点:');
        console.log('   GET  /health     - 健康检查');
        console.log('   GET  /token-info  - Token信息');
        console.log('   GET  /tools      - 获取可用工具列表');
        console.log('   POST /call       - 调用单个工具');
        console.log('   POST /batch      - 批量调用工具');
        console.log('   GET  /docs       - API文档');
        console.log('');
        console.log('🌐 内网穿透配置:');
        console.log('   使用 ngrok: ngrok http ' + this.port);
        console.log('   使用 frp: 配置本地端口 ' + this.port);
        console.log('');
        console.log('💡 提示: 配置 .env 文件中的 API_TOKEN 以连接My-Day应用');
        console.log('');
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server.close(() => {
        console.log('My-Day Network Server 已停止');
        resolve();
      });
    });
  }
}

// 启动服务器
async function main() {
  const server = new MyDayNetworkServer();
  
  try {
    await server.start();
    
    // 优雅关闭处理
    process.on('SIGINT', async () => {
      console.log('\n正在关闭服务器...');
      await server.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n正在关闭服务器...');
      await server.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

main(); 