# Claude Desktop MCP 配置指南

## 方法一：直接编辑配置文件

### 1. 找到 Claude Desktop 配置文件

Claude Desktop 的配置文件通常位于以下位置：

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### 2. 编辑配置文件

打开 `claude_desktop_config.json` 文件，添加以下配置：

```json
{
  "mcpServers": {
    "my-day-tasks": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "D:/Desktop/大二课程/工程实训/my-day - 副本/mcp-server",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**配置说明：**
- `command`: 执行命令（node）
- `args`: 命令行参数（指向编译后的index.js文件）
- `cwd`: 工作目录（MCP服务器所在路径）
- `env`: 环境变量设置

### 3. 路径配置说明

请根据你的实际路径修改 `cwd` 字段：

**Windows 示例：**
```json
"cwd": "D:/Desktop/大二课程/工程实训/my-day - 副本/mcp-server"
```

**macOS/Linux 示例：**
```json
"cwd": "/Users/username/Projects/my-day/mcp-server"
```

## 方法二：通过 Claude Desktop 界面配置

### 1. 打开 Claude Desktop 设置

1. 启动 Claude Desktop
2. 点击左上角的设置图标（齿轮图标）
3. 选择 "Settings" 或 "Preferences"

### 2. 找到开发者选项

1. 在设置页面中找到 "Developer" 或 "开发者" 选项
2. 点击进入开发者设置

### 3. 添加 MCP 服务器

1. 找到 "MCP Servers" 或 "MCP 服务器" 部分
2. 点击 "Add Server" 或 "添加服务器"
3. 填写以下信息：
   - **Name**: My-Day Tasks
   - **Command**: node
   - **Arguments**: dist/index.js
   - **Working Directory**: 你的MCP服务器路径
   - **Environment Variables**: NODE_ENV=production

## 配置前的准备工作

### 1. 确保 MCP 服务器已构建

```bash
cd mcp-server
npm run build
```

### 2. 确保环境变量已配置

```bash
cp env.example .env
# 编辑 .env 文件，配置 API_TOKEN 等参数
```

### 3. 获取 JWT Token

参考 `README.md` 中的 "获取 API Token" 部分。

## 验证配置

### 1. 重启 Claude Desktop

配置完成后，重启 Claude Desktop 应用。

### 2. 测试连接

在 Claude Desktop 中尝试以下对话：

```
用户: "帮我查看所有任务"
```

如果配置正确，Claude 应该能够使用 MCP 工具来获取任务信息。

## 故障排除

### 常见问题

1. **路径错误**
   - 确保 `cwd` 路径正确
   - 使用绝对路径而不是相对路径
   - Windows 路径使用正斜杠 `/` 或双反斜杠 `\\`

2. **文件不存在**
   - 确保已经运行 `npm run build`
   - 检查 `dist/index.js` 文件是否存在

3. **权限问题**
   - 确保有执行权限
   - 检查文件路径权限

4. **环境变量问题**
   - 确保 `.env` 文件配置正确
   - 检查 API_TOKEN 是否有效

### 调试方法

1. **查看日志**
   - 在 MCP 服务器目录运行 `npm start` 查看输出
   - 检查是否有错误信息

2. **测试 API 连接**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/tasks
   ```

3. **检查端口占用**
   ```bash
   netstat -an | findstr :4000
   ```

## 完整配置示例

```json
{
  "mcpServers": {
    "my-day-tasks": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "D:/Desktop/大二课程/工程实训/my-day - 副本/mcp-server",
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "otherSettings": {
    // 其他 Claude Desktop 设置
  }
}
```

## 注意事项

1. **路径格式**: Windows 路径建议使用正斜杠 `/`
2. **权限**: 确保 Claude Desktop 有访问 MCP 服务器目录的权限
3. **防火墙**: 确保防火墙允许相关端口访问
4. **版本兼容**: 确保 Node.js 版本兼容（建议 18+）

## 更新配置

如果需要更新配置：

1. 停止 Claude Desktop
2. 编辑配置文件
3. 重启 Claude Desktop

配置更改会立即生效。 