# AI API 配置说明

## 硅流API配置

为了使用AI聊天功能，您需要配置硅流API密钥。

### 1. 获取API密钥

1. 访问 [硅流官网](https://www.siliconflow.cn/)
2. 注册并登录账户
3. 在控制台中获取API密钥

### 2. 配置环境变量

在 `server` 目录下创建 `.env` 文件，添加以下内容：

```env
# 数据库配置
DATABASE_URL="mysql://root:123456@localhost:3306/AI2"

# JWT密钥
JWT_SECRET="your-jwt-secret-key-here"

# 硅流API配置
SILICONFLOW_API_KEY="your-siliconflow-api-key-here"
```

### 3. 支持的模型

硅流API支持以下模型：

- `Qwen/Qwen2.5-VL-72B-Instruct` - 72B视觉语言模型
- `Qwen/Qwen2.5-72B-Instruct` - 72B指令模型
- `Qwen/Qwen2.5-14B-Instruct` - 14B指令模型
- `Qwen/Qwen2.5-7B-Instruct` - 7B指令模型
- `Qwen/Qwen2.5-1.5B-Instruct` - 1.5B指令模型
- `Qwen/Qwen2.5-0.5B-Instruct` - 0.5B指令模型

### 4. 启动服务器

配置完成后，启动服务器：

```bash
cd server
npm run dev
```

### 注意事项

- 请确保API密钥的安全性，不要将其提交到版本控制系统
- 如果API调用失败，系统会自动回退到模拟回复
- 建议在生产环境中使用更安全的密钥管理方式 