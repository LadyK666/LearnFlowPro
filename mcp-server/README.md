# My-Day MCP Server

这是一个为 My-Day 任务管理应用提供的 MCP (Model Context Protocol) 服务器，允许 AI Agent 通过 MCP 协议操作任务。

## 功能特性

- **任务查看**: 获取所有任务列表，支持按类别、优先级、完成状态筛选
- **任务详情**: 根据任务ID获取单个任务的详细信息
- **任务创建**: 创建新的任务
- **任务更新**: 更新任务信息
- **任务删除**: 删除指定任务
- **状态切换**: 切换任务的完成状态
- **统计信息**: 获取任务统计信息

## 安装和配置

### 1. 安装依赖

```bash
cd mcp-server
npm install
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下参数：

```env
# My-Day API 配置
API_URL=http://localhost:4000/api
API_TOKEN=your_jwt_token_here

# MCP 服务器配置
MCP_SERVER_PORT=3001
```

**注意**: `API_TOKEN` 需要从 My-Day 应用中获取有效的 JWT Token。

### 3. 获取 API Token

JWT Token 存储在浏览器的 localStorage 中。获取步骤：

1. **登录 My-Day 应用**
   - 在浏览器中打开 My-Day 应用
   - 使用你的账号登录

2. **打开开发者工具**
   - 按 `F12` 键打开开发者工具
   - 或者右键点击页面 -> 检查

3. **找到 Local Storage**
   - 在开发者工具中点击 "Application" 标签
   - 在左侧面板中找到 "Local Storage"
   - 点击你的网站域名（通常是 `http://localhost:5173` 或类似地址）

4. **复制 Token**
   - 在右侧面板中找到 `token` 键
   - 复制对应的值（这是一个很长的字符串，通常以 `eyJ` 开头）

5. **配置 Token**
   - 打开 `mcp-server/.env` 文件
   - 将复制的 token 粘贴到 `API_TOKEN=` 后面
   - 保存文件

**示例 .env 文件：**
```env
API_URL=http://localhost:4000/api
API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczNDU2Nzg5MCwiZXhwIjoxNzM0NjU0MjkwfQ.example_signature
MCP_SERVER_PORT=3001
```

**💡 提示：**
- Token 有时效性，过期需要重新获取
- 确保在登录状态下获取 token
- 如果看不到 token，请检查是否已正确登录

## 启动服务器

### 使用启动脚本

```bash
chmod +x start.sh
./start.sh
```

### 手动启动

```bash
# 构建项目
npm run build

# 启动服务器
npm start
```

### 开发模式

```bash
npm run dev
```

## 使用方法

### 在 Claude Desktop 中配置

1. 打开 Claude Desktop
2. 进入设置 -> 开发者
3. 添加 MCP 服务器：
   - 名称: My-Day Tasks
   - 命令: `node /path/to/mcp-server/dist/index.js`
   - 工作目录: `/path/to/mcp-server`

### 在 Anthropic Console 中配置

1. 登录 Anthropic Console
2. 进入工具配置
3. 添加 MCP 服务器配置

## 可用工具

### 1. list_tasks
获取任务列表，支持筛选

**参数**:
- `category` (可选): 任务类别筛选
- `priority` (可选): 优先级筛选
- `completed` (可选): 完成状态筛选
- `isToday` (可选): 今日任务筛选
- `limit` (可选): 返回数量限制

### 2. get_task
获取单个任务详情

**参数**:
- `taskId` (必需): 任务ID

### 3. create_task
创建新任务

**参数**:
- `title` (必需): 任务标题
- `description` (可选): 任务描述
- `category` (必需): 任务类别
- `priority` (必需): 优先级 (0-3)
- `isToday` (可选): 是否为今日任务

### 4. update_task
更新任务信息

**参数**:
- `taskId` (必需): 任务ID
- `title` (可选): 任务标题
- `description` (可选): 任务描述
- `category` (可选): 任务类别
- `priority` (可选): 优先级
- `isToday` (可选): 是否为今日任务
- `completed` (可选): 完成状态

### 5. delete_task
删除任务

**参数**:
- `taskId` (必需): 任务ID

### 6. toggle_task_completion
切换任务完成状态

**参数**:
- `taskId` (必需): 任务ID

### 7. get_task_statistics
获取任务统计信息

**参数**:
- `isToday` (可选): 是否只统计今日任务

## 示例对话

用户: "帮我查看所有未完成的任务"

Claude: 我将使用 `list_tasks` 工具来查看未完成的任务。

用户: "创建一个高优先级的健康任务"

Claude: 我将使用 `create_task` 工具来创建一个高优先级的健康任务。

用户: "统计一下今日任务的完成情况"

Claude: 我将使用 `get_task_statistics` 工具来获取今日任务的统计信息。

## 故障排除

### 常见问题

1. **API Token 无效**
   - 确保在 My-Day 应用中已登录
   - 检查 localStorage 中的 token 是否有效
   - 重新获取 token 并更新 .env 文件

2. **连接失败**
   - 确保 My-Day 后端服务器正在运行
   - 检查 API_URL 配置是否正确
   - 确认端口 4000 没有被其他程序占用

3. **权限错误**
   - 确保使用的 token 对应的用户有相应权限
   - 检查任务是否属于当前用户

## 开发

### 项目结构

```
mcp-server/
├── src/
│   ├── index.ts          # MCP 服务器主文件
│   └── taskManager.ts    # 任务管理器
├── package.json
├── tsconfig.json
├── env.example
├── start.sh
└── README.md
```

### 添加新功能

1. 在 `taskManager.ts` 中添加新的方法
2. 在 `index.ts` 中注册新的工具
3. 更新工具描述和参数定义
4. 测试新功能

## 许可证

MIT License 