#!/bin/bash

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "请先复制 env.example 为 .env 并配置相关参数"
    cp env.example .env
    echo "已创建 .env 文件，请编辑配置参数后重新运行"
    exit 1
fi

# 安装依赖
echo "安装依赖..."
npm install

# 构建项目
echo "构建项目..."
npm run build

# 启动服务器
echo "启动 MCP 服务器..."
npm start 