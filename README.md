# LearnFlow Pro - 任务管理与AI助手平台

一个现代化的多端任务管理与AI集成平台，支持前端Web、后端API、MCP协议服务、AI远程调用等多模块协作，助力高效管理任务、数据与智能优化。

---

## 📁 项目目录结构

```
LearnFlowPro/
├── src/                    # 前端主应用（React + TS + Vite）
│   ├── components/         # 复用组件（含AI、任务、UI等）
│   ├── pages/              # 页面组件（首页、任务池、今日、设置等）
│   ├── contexts/           # React Context 状态管理
│   ├── hooks/              # 自定义Hooks
│   ├── lib/                # 工具函数
│   ├── types/              # TS类型定义
│   └── ...
├── server/                 # 后端服务（Express + Prisma + TS）
│   ├── src/                # 后端源码
│   │   ├── routes/         # API路由（auth、tasks、ai等）
│   │   ├── middleware/     # 中间件
│   │   └── utils/          # 工具/定时器/迁移
│   ├── prisma/             # 数据库模型与迁移
│   └── ...
├── mcp-server/             # MCP协议服务（AI Agent/Claude/Anthropic集成）
│   ├── src/                # MCP服务源码
│   ├── browser-extension/  # 浏览器扩展
│   ├── demo.js             # 交互式MCP演示脚本
│   ├── start.sh            # 一键启动脚本
│   └── ...
├── my-day-network-server/  # AI远程调用网络服务（HTTP+WebSocket）
│   ├── src/                # 网络服务源码
│   ├── scripts/            # Token设置脚本
│   ├── start.bat           # Windows一键启动
│   └── ...
├── public/                 # 静态资源
├── dist/                   # 前端构建输出
├── package.json            # 根依赖
├── pnpm-lock.yaml          # 包管理锁
├── README.md               # 项目说明
└── ...
```

---

## 🧩 各子模块功能简介

### 1. 前端主应用（src/）
- 任务池、今日计划、数据分析、AI对话、设置等页面
- 支持任务创建、编辑、分类、优先级、进度跟踪、数据导入导出
- 响应式极简UI，支持深浅主题切换
- 本地存储/后端API双模式

### 2. 后端服务（server/）
- 提供RESTful API（用户认证、任务管理、AI接口等）
- 使用Prisma ORM管理MySQL数据库，支持任务分类自动迁移、定时维护
- 支持JWT鉴权，API文档详尽
- 可独立部署，支持本地与云端

### 3. MCP协议服务（mcp-server/）
- 本地MCP Server，供本地AI（如Claude Desktop、Anthropic Console等）通过MCP协议直接操作本地任务系统
- 提供任务增删查改、统计、AI优化等工具
- 支持与本地AI平台集成
- 附带一键启动脚本与交互式演示

### 4. 服务器MCP桥接服务（my-day-network-server/）
- 作为服务器端AI（如云端AI服务）通过MCP协议链接本地MCPserver的桥接服务
- 支持HTTP API与WebSocket，供远程AI批量调用任务相关工具
- Token统一管理，支持热更新
- 提供健康检查、API文档、批量工具调用等接口
- 主要用于云端AI与本地任务系统的数据交互和API转发

---

## 🚀 部署与启动方式

## 0.首次启动前置工作

在开始之前，请确保您的电脑上已经安装了以下软件：

1. **[Node.js](https://nodejs.org/)**: 请确保您的 Node.js 版本为 `v18.0` 或更高。
2. **[pnpm](https://pnpm.io/installation)**: 我们项目使用的包管理器。如果尚未安装，请在终端中运行以下命令进行全局安装：
   ```bash
   npm install -g pnpm
   ```
3. **[MySQL](https://dev.mysql.com/downloads/installer/)**: 本地数据库服务。请确保它已在您的电脑上安装并正在运行。

请严格按照以下顺序执行操作：

### 第1步：克隆项目代码

打开您的终端，将项目代码从 Git 仓库克隆到本地。

```bash
# 将 [仓库地址] 替换为实际的 Git 仓库 URL
git clone [仓库地址]

# 进入项目根目录
cd LearnFlowPro
```

### 第2步：安装项目所有依赖

在项目根目录 (`LearnFlowPro/`) 下，运行一个命令即可同时安装前端和后端的所有依赖。

```bash
pnpm install -r
```
> ` -r ` 参数代表 `recursive`，它会自动找到工作区内的所有项目（前端和 `server/`）并为其安装依赖。

### 第3步：配置后端环境变量

这是最关键的一步，它将告诉后端服务如何连接到您本地的数据库。

1.  **进入后端目录**：
    ```bash
    cd server
    ```
2.  **创建本地环境文件**：
    在 `server/` 目录下，您会看到一个名为 `.env `的环境配置文件。
    
3.  **编辑 `.env` 文件**：
    用您的代码编辑器打开刚刚创建的 `.env` 文件。您会看到以下内容：
    ```
    # 数据库连接字符串，请替换为本地的实际配置
    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
    SILICONFLOW_API_KEY=""#内置AI的调用api，本人使用的硅基流动api
    ```
    请将 `DATABASE_URL` 的值修改为您**本地 MySQL 数据库的真实连接字符串**。您需要替换 `USER`, `PASSWORD`, `HOST`, `PORT`, 和 `DATABASE`。
    
    **连接字符串示例：**
    ```
    # 假设您的MySQL用户名是 root，密码是 mysecretpass，数据库运行在本地默认端口3306，您想使用的数据库名叫 myday_db
    DATABASE_URL="mysql://root:mysecretpass@localhost:3306/myday_db"
    ```
    > **注意**: 如果名为 `myday_db` 的数据库尚不存在，下一步的命令会自动为您创建它。

### 第4步：运行数据库迁移

此步骤会根据您的 `.env` 文件配置，连接到数据库，并自动创建所有需要的表结构。

*   请确保您当前的终端目录依然在 `server/` 下。
*   提前删除掉`prisma/migrations/`下的所有迁移记录文件夹（如果有的话，不要删除toml文件）
*   运行以下命令：
    ```bash
    pnpm prisma migrate dev
    ```
*   首次运行时，它可能会提示您为这次迁移输入一个名称，您可以输入 `init` 然后按回车。

现在数据库初始化已经成功

### 1. 前端（src/）
- 依赖：Node.js >= 16，pnpm >= 7
- 安装依赖（如果需要）：
  ```bash
  pnpm install
  ```
- 启动开发（常用）：
  ```bash
  pnpm dev
  # 默认 http://localhost:5173
  ```
- 构建生产包：
  ```bash
  pnpm build
  # 输出到 dist/
  ```
- 预览构建：
  ```bash
  pnpm preview
  ```
- 静态部署：将 dist/ 上传至任意静态服务器（Netlify、Vercel、GitHub Pages等）

### 2. 后端服务（server/）
- 依赖：Node.js >= 16，MySQL 8.x

- 安装依赖（如果需要）：
  ```bash
  cd server
  npm install
  ```
  
- 启动开发：
  ```bash
  pnpm dev
  # 默认 http://localhost:4000
  ```
  
- 生产构建与启动：
  ```bash
  npm run build
  npm start
  ```
  
- 数据库迁移：
  ```bash
  npx prisma migrate deploy
  ```

至此，您应该可以在浏览器看到项目的登录界面，数据库和内置AI都可使用。

### 3. MCP协议服务（mcp-server/）（可选）
- 依赖：Node.js >= 18

- 安装依赖：
  ```bash
  cd mcp-server
  npm install
  ```
  
- 配置环境变量：
  ```bash
  .env文件填写
  ```
  
- 构建与启动：
  ```bash
  npm run build
  npm start
  # 或一键脚本 ./start.sh
  ```

完成后，Claude DeskTop ，LMStudio均可以配置MCP，文章末尾给出了**链接示例**

### 4. MCP协议服务网络端（my-day-network-server/）
- 依赖：Node.js >= 16

- 安装依赖：
  ```bash
  cd my-day-network-server
  npm install
  ```
  
- 生产构建与启动：
  ```bash
  npm run build
  npm start
  ```
  
- 支持HTTP API与WebSocket，详见 my-day-network-server/README.md

## 5. 本地模型应用的MCP工具注册示例

1.在Claude Desktop , LM Studio的mcpjson配置中，添加：

```json
{
  "mcpServers": {
    "my-day-tasks": {
      "command": "node",
      "args": ["你的路径/LearnFlowPro/mcp-server/dist/index.js"],

      "cwd": "你的路径/LearnFlowPro/mcp-server",
      "env": {
        "NODE_ENV": "production"
      },
      "url": "http://localhost:4000"
    }
  }
}

```

2.确保之前的后端都已经打开

3.重启应用即可

4.可以看到my-day-tasks的工具已经激活，尝试使用提供的api功能，刷新软件前端查看更新后任务。

![image-20250630162313652](D:\Desktop\大二课程\工程实训\LearnFlowPro\LearnFlowPro\README.assets\image-20250630162313652.png)

---

## 6.服务器模型应用MCP工具注册示例

在扣子空间等agent和一些网络llm，远程http请求无法传递到本地后端，我们采取内网穿透方式实现

1.保证`my-day-network-server/`服务端开启，并在端口运行(默认http://localhost:3001)

2.下载ngork，执行:

```
ngork http 3001 #my-day-network-server端口号
```

你会得到内网穿透后的网址，后面只会用到这个网址

```
https://abcd.ngrok-free.app
```

3.之后的工作和本地MCP注册一致

- 以扣子空间为例，打开工作空间，个人空间，创建应用，创建工作流，添加一个**http请求节点**

- 填写url 等信息，也可以用crul导入

- 请求体（以list_tasks为例）

  ```
  {"name":"list_tasks","arguments":{}}
  ```

- 测试成功上传为MCP封装

- agent内，调用扩展，MCP，自定义，看到注册好的MCP工具

这个头一次构造工作流可能不太理解，看一看知乎文章

**有明显缺点，当ngork断开后，下一次的url也需要变化，可以选择固定url的内网穿透方式**

## ⚙️ 关键技术点与自动化脚本

- 全栈TypeScript，类型安全
- 前后端分离，接口规范清晰
- 任务分类自动标准化（定时器/一键迁移/脚本）
- MCP协议支持AI Agent远程操作
- Token统一管理与热更新
- 支持批量任务处理、AI优化建议、数据导入导出
- 交互式演示脚本（mcp-server/demo.js）
- 多端部署脚本（start.sh、start.bat）

---

## 📝 贡献与支持

- 欢迎提交PR、Issue，完善功能与文档
- 代码风格：严格TypeScript、ESLint、函数式组件+Hooks、TailwindCSS原子类
- 详细开发规范与扩展方式见各子模块README与PROJECT_STRUCTURE.md

---

## 📄 许可证

MIT License

---

## 👥 作者与致谢

- 开发者：LadyK MC Infinity
- 致谢：React、TailwindCSS、Prisma、Vite、Lucide React、Anthropic、Claude等开源项目

---

> 让每一天都更高效！立即体验 LearnFlow Pro 多端智能任务管理！
