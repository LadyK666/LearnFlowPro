#!/usr/bin/env node

/**
 * My-Day MCP Server 演示脚本
 * 展示如何通过 MCP 协议操作任务
 */

import { spawn } from 'child_process';
import readline from 'readline';

// 创建命令行界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('? My-Day MCP Server 演示');
console.log('========================');
console.log('');

// 模拟 MCP 客户端
class MCPClient {
  constructor() {
    this.serverProcess = null;
  }

  // 启动 MCP 服务器
  startServer() {
    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.serverProcess.stderr.on('data', (data) => {
        const message = data.toString();
        if (message.includes('My-Day MCP Server is running')) {
          console.log('? MCP 服务器已启动');
          resolve();
        }
      });

      this.serverProcess.on('error', (error) => {
        reject(error);
      });

      // 设置超时
      setTimeout(() => {
        reject(new Error('服务器启动超时'));
      }, 5000);
    });
  }

  // 发送 MCP 请求
  sendRequest(method, params) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params
      };

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

      this.serverProcess.stdout.once('data', (data) => {
        try {
          const response = JSON.parse(data.toString());
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // 停止服务器
  stop() {
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

// 演示函数
async function runDemo() {
  const client = new MCPClient();

  try {
    // 启动服务器
    await client.startServer();
    console.log('');

    // 演示 1: 列出所有任务
    console.log('? 演示 1: 列出所有任务');
    console.log('------------------------');
    const listResponse = await client.sendRequest('tools/list', {});
    console.log('可用工具:', JSON.stringify(listResponse, null, 2));
    console.log('');

    // 演示 2: 创建任务
    console.log('? 演示 2: 创建新任务');
    console.log('------------------------');
    const createResponse = await client.sendRequest('tools/call', {
      name: 'create_task',
      arguments: {
        title: 'MCP 演示任务',
        description: '这是一个通过 MCP 协议创建的任务',
        category: 'work',
        priority: 2,
        isToday: true
      }
    });
    console.log('创建结果:', JSON.stringify(createResponse, null, 2));
    console.log('');

    // 演示 3: 获取任务统计
    console.log('? 演示 3: 获取任务统计');
    console.log('------------------------');
    const statsResponse = await client.sendRequest('tools/call', {
      name: 'get_task_statistics',
      arguments: {
        isToday: true
      }
    });
    console.log('统计结果:', JSON.stringify(statsResponse, null, 2));
    console.log('');

    console.log('? 演示完成！');
    console.log('');
    console.log('? 提示:');
    console.log('- 在 Claude Desktop 中配置 MCP 服务器');
    console.log('- 使用自然语言与 AI 交互');
    console.log('- AI 会自动调用相应的工具');

  } catch (error) {
    console.error('? 演示失败:', error.message);
  } finally {
    client.stop();
    rl.close();
  }
}

// 交互式菜单
function showMenu() {
  console.log('请选择操作:');
  console.log('1. 运行完整演示');
  console.log('2. 查看配置说明');
  console.log('3. 退出');
  console.log('');

  rl.question('请输入选项 (1-3): ', (answer) => {
    switch (answer.trim()) {
      case '1':
        runDemo();
        break;
      case '2':
        showConfigHelp();
        break;
      case '3':
        console.log('? 再见！');
        rl.close();
        break;
      default:
        console.log('? 无效选项，请重新选择');
        showMenu();
    }
  });
}

function showConfigHelp() {
  console.log('');
  console.log('? 配置说明');
  console.log('==========');
  console.log('');
  console.log('1. 确保 My-Day 后端服务器正在运行 (端口 4000)');
  console.log('2. 在 My-Day 应用中登录并获取 JWT Token');
  console.log('3. 复制 env.example 为 .env 并配置 API_TOKEN');
  console.log('4. 运行 npm install 安装依赖');
  console.log('5. 运行 npm run build 构建项目');
  console.log('');
  console.log('? 获取 Token 步骤:');
  console.log('- 在浏览器中打开 My-Day 应用');
  console.log('- 按 F12 打开开发者工具');
  console.log('- 进入 Application -> Local Storage');
  console.log('- 找到 token 字段并复制值');
  console.log('- 粘贴到 .env 文件的 API_TOKEN 字段');
  console.log('');
  
  rl.question('按回车键返回主菜单...', () => {
    console.log('');
    showMenu();
  });
}

// 启动程序
if (process.argv.includes('--help')) {
  console.log('My-Day MCP Server 演示程序');
  console.log('');
  console.log('用法:');
  console.log('  node demo.js          # 启动交互式演示');
  console.log('  node demo.js --help   # 显示帮助信息');
  console.log('');
  process.exit(0);
} else {
  showMenu();
} 