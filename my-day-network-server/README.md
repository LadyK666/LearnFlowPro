# My-Day Network Server

这是一个专门为远程AI访问设计的My-Day任务管理网络服务器，支持HTTP API和WebSocket通信。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置Token
```bash
# 设置JWT Token（必需）
node scripts/set-token.js "你的JWT Token"

# 如何获取JWT Token:
# 1. 在浏览器中打开My-Day应用
# 2. 登录你的账号
# 3. 按F12打开开发者工具
# 4. 点击Application标签
# 5. 在左侧找到Local Storage
# 6. 点击你的网站域名
# 7. 找到token键，复制对应的值
```

### 3. 配置环境变量（可选）
```bash
# 复制环境变量示例文件
copy env.example .env

# 编辑 .env 文件，配置以下参数：
# - SERVER_PORT: 服务器端口（默认3001）
# - API_URL: My-Day API地址（默认http://localhost:4000/api）
```

### 4. 启动服务器
```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start

# 使用批处理脚本（Windows）
start.bat
```

## 📡 服务器功能

### HTTP API 端点
- `GET /health` - 健康检查
- `GET /token-info` - Token信息
- `GET /tools` - 获取可用工具列表
- `POST /call` - 调用单个工具
- `POST /batch` - 批量调用工具
- `GET /docs` - API文档

### WebSocket 支持
- 实时工具调用
- 心跳检测
- 连接状态管理

## 🔧 Token管理

### 设置Token
```bash
node scripts/set-token.js "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 查看Token信息
```bash
curl http://localhost:3001/token-info
```

### Token文件位置
Token保存在项目根目录的 `token.txt` 文件中，服务器会自动监听文件变化并重新加载。

## 🔧 可用工具

### 1. list_tasks
获取任务列表，支持筛选
```json
{
  "name": "list_tasks",
  "arguments": {
    "category": "work",
    "completed": false
  }
}
```

### 2. get_task
获取单个任务详情
```json
{
  "name": "get_task",
  "arguments": {
    "taskId": 1
  }
}
```

### 3. create_task
创建新任务
```json
{
  "name": "create_task",
  "arguments": {
    "title": "新任务",
    "category": "work",
    "priority": 2,
    "isToday": true
  }
}
```

### 4. update_task
更新任务信息
```json
{
  "name": "update_task",
  "arguments": {
    "taskId": 1,
    "title": "更新的标题",
    "completed": true
  }
}
```

### 5. delete_task
删除任务
```json
{
  "name": "delete_task",
  "arguments": {
    "taskId": 1
  }
}
```

### 6. toggle_task_completion
切换任务完成状态
```json
{
  "name": "toggle_task_completion",
  "arguments": {
    "taskId": 1
  }
}
```

### 7. get_task_statistics
获取任务统计信息
```json
{
  "name": "get_task_statistics",
  "arguments": {
    "isToday": true
  }
}
```

## 🌐 内网穿透配置

### 使用 ngrok
```bash
# 安装 ngrok
npm install -g ngrok

# 启动隧道
ngrok http 3001
```

### 使用 frp
```ini
# frpc.ini
[my-day-server]
type = tcp
local_ip = 127.0.0.1
local_port = 3001
remote_port = 3001
```

## 📝 使用示例

### JavaScript/Node.js
```javascript
// 获取任务列表
const response = await fetch('http://localhost:3001/call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'list_tasks',
    arguments: { category: 'work' }
  })
});

const result = await response.json();
console.log(result);
```

### Python
```python
import requests

response = requests.post('http://localhost:3001/call', json={
    'name': 'list_tasks',
    'arguments': {'category': 'work'}
})

result = response.json()
print(result)
```

### WebSocket
```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'call',
    name: 'list_tasks',
    arguments: { category: 'work' }
  }));
};

ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  console.log(result);
};
```

## 🔒 安全配置

### 生产环境建议
1. 限制CORS来源
2. 添加身份验证
3. 使用HTTPS
4. 配置防火墙
5. 启用请求日志

### 环境变量配置
```env
# 安全配置
CORS_ORIGIN=https://your-domain.com
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 日志配置
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

## 🛠️ 故障排除

### 常见问题

1. **Token无效或过期**
   ```bash
   # 重新设置Token
   node scripts/set-token.js "新的JWT Token"
   ```

2. **端口被占用**
   ```bash
   # 查看端口占用
   netstat -ano | findstr :3001
   
   # 修改端口
   # 在 .env 文件中设置 SERVER_PORT=3002
   ```

3. **连接超时**
   - 检查网络连接
   - 确认服务器正在运行
   - 检查防火墙设置

4. **CORS错误**
   - 检查服务器CORS配置
   - 确认请求来源

## 📊 监控和日志

### 健康检查
```bash
curl http://localhost:3001/health
```

### 获取Token信息
```bash
curl http://localhost:3001/token-info
```

### 获取服务器状态
```bash
curl http://localhost:3001/docs
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## �� 许可证

MIT License 