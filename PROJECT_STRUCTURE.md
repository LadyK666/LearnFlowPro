# My-Day 项目目录结构

## 📁 根目录 (项目根目录)
```
my-day - 副本/
├── 📁 server/                    # 后端服务器 (Express + Prisma + TypeScript)
├── 📁 mcp-server/                # MCP服务器 (Model Context Protocol)
├── 📁 src/                       # 前端源码 (React + TypeScript + Vite)
├── 📁 public/                    # 静态资源文件
├── 📁 dist/                      # 构建输出目录
├── 📁 node_modules/              # 前端依赖包
├── 📄 package.json               # 前端项目配置
├── 📄 pnpm-lock.yaml            # 依赖锁定文件
├── 📄 tailwind.config.js        # Tailwind CSS配置
├── 📄 vite.config.ts            # Vite构建工具配置
├── 📄 tsconfig.json             # TypeScript配置
└── 📄 README.md                 # 项目说明文档
```

## 🖥️ 前端源码目录 (src/)
```
src/
├── 📁 components/                # React组件库
│   ├── 📁 ui/                   # 基础UI组件 (shadcn/ui)
│   │   ├── 📄 button.tsx        # 按钮组件
│   │   ├── 📄 card.tsx          # 卡片组件
│   │   ├── 📄 dialog.tsx        # 对话框组件
│   │   ├── 📄 input.tsx         # 输入框组件
│   │   ├── 📄 select.tsx        # 选择器组件
│   │   ├── 📄 toast.tsx         # 通知组件
│   │   └── ...                  # 其他UI组件
│   ├── 📁 AIChat/               # AI聊天相关组件
│   │   ├── 📄 AIChatButton.tsx  # AI聊天按钮
│   │   ├── 📄 AIChatDialog.tsx  # AI聊天对话框
│   │   └── 📄 ChatMessage.tsx   # 聊天消息组件
│   ├── 📁 Auth/                 # 认证相关组件
│   │   └── 📄 AuthForm.tsx      # 登录/注册表单
│   ├── 📁 Layout/               # 布局组件
│   │   ├── 📄 Layout.tsx        # 主布局组件
│   │   └── 📄 Navigation.tsx    # 导航栏组件
│   ├── 📁 Task/                 # 任务相关组件
│   │   ├── 📄 TaskCard.tsx      # 任务卡片组件
│   │   └── 📄 TaskModal.tsx     # 任务模态框
│   ├── 📄 OptimizationDialog.tsx # 任务优化对话框
│   ├── 📄 TaskConfirmationDialog.tsx # 任务确认对话框
│   └── 📄 ErrorBoundary.tsx     # 错误边界组件
├── 📁 pages/                    # 页面组件
│   ├── 📄 HomePage.tsx          # 首页
│   ├── 📄 TodayPage.tsx         # 今日任务页面
│   ├── 📄 TaskPoolPage.tsx      # 任务池页面
│   ├── 📄 AIChatPage.tsx        # AI聊天页面
│   ├── 📄 AnalyticsPage.tsx     # 数据分析页面
│   ├── 📄 SettingsPage.tsx      # 设置页面
│   ├── 📄 LoginPage.tsx         # 登录页面
│   └── 📄 RegisterPage.tsx      # 注册页面
├── 📁 contexts/                 # React Context状态管理
│   ├── 📄 AuthContext.tsx       # 认证状态管理
│   ├── 📄 TasksContext.tsx      # 任务状态管理
│   ├── 📄 ThemeContext.tsx      # 主题状态管理
│   └── 📄 AIChatContext.tsx     # AI聊天状态管理
├── 📁 hooks/                    # 自定义React Hooks
│   ├── 📄 use-toast.ts          # 通知Hook
│   └── 📄 use-mobile.tsx        # 移动端检测Hook
├── 📁 lib/                      # 工具库
│   ├── 📄 utils.ts              # 通用工具函数
│   └── 📄 taskUtils.ts          # 任务相关工具函数
├── 📁 types/                    # TypeScript类型定义
│   └── 📄 index.ts              # 全局类型定义
├── 📄 App.tsx                   # 主应用组件
├── 📄 main.tsx                  # 应用入口文件
├── 📄 index.css                 # 全局样式文件
└── 📄 vite-env.d.ts             # Vite环境类型定义
```

## 🖥️ 后端服务器目录 (server/)
```
server/
├── 📁 src/                      # 后端源码
│   ├── 📁 routes/               # API路由
│   │   ├── 📄 auth.ts           # 认证相关API
│   │   ├── 📄 tasks.ts          # 任务管理API
│   │   └── 📄 ai.ts             # AI功能API
│   ├── 📁 middleware/           # 中间件
│   │   └── 📄 auth.ts           # 认证中间件
│   ├── 📁 utils/                # 工具函数
│   │   ├── 📄 categoryMigration.ts # 类别迁移工具
│   │   └── 📄 categoryTimer.ts  # 定时器工具
│   └── 📄 index.ts              # 服务器入口文件
├── 📁 prisma/                   # 数据库ORM配置
│   ├── 📁 migrations/           # 数据库迁移文件
│   │   └── 📁 20250629135331_init/ # 初始化迁移
│   │       └── 📄 migration.sql # SQL迁移脚本
│   ├── 📄 schema.prisma         # 数据库模型定义
│   └── 📄 migration_lock.toml   # 迁移锁定文件
├── 📄 package.json              # 后端项目配置
├── 📄 tsconfig.json             # TypeScript配置
├── 📄 API_SETUP.md              # API设置说明
└── 📄 CATEGORY_MIGRATION.md     # 类别迁移说明
```

## 🤖 MCP服务器目录 (mcp-server/)
```
mcp-server/
├── 📁 src/                      # MCP源码
│   ├── 📄 index.ts              # MCP服务器入口
│   ├── 📄 tokenManager.ts       # Token管理
│   ├── 📄 simpleTokenManager.ts # 简化Token管理
│   └── 📄 taskManager.ts        # 任务管理
├── 📁 browser-extension/        # 浏览器扩展
│   ├── 📄 content.js            # 内容脚本
│   └── 📄 manifest.json         # 扩展清单
├── 📁 dist/                     # 构建输出
├── 📄 package.json              # MCP项目配置
├── 📄 tsconfig.json             # TypeScript配置
├── 📄 claude_desktop_config.json # Claude Desktop配置
├── 📄 env.example               # 环境变量示例
├── 📄 get-token.js              # 获取Token脚本
├── 📄 quick-token.js            # 快速Token脚本
├── 📄 update-token.js           # 更新Token脚本
├── 📄 setup-env.js              # 环境设置脚本
├── 📄 demo.js                   # 演示脚本
├── 📄 start.sh                  # 启动脚本
├── 📄 README.md                 # MCP说明文档
└── 📄 CLAUDE_DESKTOP_SETUP.md   # Claude Desktop设置说明
```

## 📁 其他重要目录
```
public/                          # 静态资源目录
├── 📄 use.txt                   # 使用说明文件

dist/                           # 前端构建输出目录
├── 📄 index.html               # 构建后的HTML文件
├── 📄 assets/                  # 构建后的资源文件
└── 📄 ...                      # 其他构建文件

node_modules/                   # 依赖包目录
├── 📁 react/                   # React框架
├── 📁 @types/                  # TypeScript类型定义
├── 📁 tailwindcss/             # Tailwind CSS框架
└── 📁 ...                      # 其他依赖包
```

## 🔧 配置文件说明

### 前端配置文件
- **package.json**: 项目依赖和脚本配置
- **vite.config.ts**: Vite构建工具配置
- **tailwind.config.js**: Tailwind CSS样式配置
- **tsconfig.json**: TypeScript编译配置
- **eslint.config.js**: 代码规范配置
- **postcss.config.js**: CSS后处理器配置

### 后端配置文件
- **server/package.json**: 后端依赖和脚本配置
- **server/tsconfig.json**: 后端TypeScript配置
- **server/prisma/schema.prisma**: 数据库模型定义

### MCP配置文件
- **mcp-server/package.json**: MCP依赖配置
- **mcp-server/tsconfig.json**: MCP TypeScript配置
- **mcp-server/claude_desktop_config.json**: Claude Desktop集成配置

## 🚀 项目架构特点

1. **前后端分离**: 前端使用React + TypeScript，后端使用Express + Prisma
2. **类型安全**: 全栈TypeScript，确保类型安全
3. **现代化UI**: 使用shadcn/ui组件库和Tailwind CSS
4. **数据库ORM**: 使用Prisma进行数据库操作
5. **AI集成**: 集成AI聊天功能和任务优化
6. **定时任务**: 自动类别迁移和数据处理
7. **MCP支持**: 支持Model Context Protocol扩展

## 📋 主要功能模块

- **任务管理**: 创建、编辑、删除、分类任务
- **AI助手**: 智能任务优化和建议
- **数据统计**: 任务完成情况分析
- **用户认证**: 登录注册功能
- **主题切换**: 深色/浅色模式
- **数据导入导出**: 任务数据备份恢复
- **自动维护**: 定时类别标准化 