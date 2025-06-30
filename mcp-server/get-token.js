#!/usr/bin/env node

/**
 * 快速获取 My-Day JWT Token 的脚本
 */

const fs = require('fs');
const path = require('path');

console.log('? My-Day JWT Token 获取工具');
console.log('============================');
console.log('');

// 检查是否在正确的目录
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envExamplePath)) {
  console.error('? 找不到 env.example 文件，请确保在 mcp-server 目录中运行此脚本');
  process.exit(1);
}

// 如果 .env 文件不存在，从示例文件复制
if (!fs.existsSync(envPath)) {
  console.log('? 创建 .env 文件...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('? .env 文件已创建');
}

console.log('? 获取 JWT Token 的详细步骤：');
console.log('');
console.log('1. ? 启动 My-Day 应用');
console.log('   - 确保后端服务器正在运行 (端口 4000)');
console.log('   - 启动前端应用 (通常是 npm run dev)');
console.log('   - 在浏览器中访问应用');
console.log('');
console.log('2. ? 登录应用');
console.log('   - 使用你的账号登录 My-Day 应用');
console.log('   - 确保登录成功');
console.log('');
console.log('3. ? 打开开发者工具');
console.log('   - 按 F12 键');
console.log('   - 或者右键点击页面 -> 检查');
console.log('');
console.log('4. ? 找到 Local Storage');
console.log('   - 点击 "Application" 标签');
console.log('   - 在左侧找到 "Local Storage"');
console.log('   - 点击你的网站域名');
console.log('');
console.log('5. ? 复制 Token');
console.log('   - 找到 "token" 键');
console.log('   - 复制对应的值（长字符串，以 eyJ 开头）');
console.log('');
console.log('6. ?? 配置 Token');
console.log('   - 打开 mcp-server/.env 文件');
console.log('   - 将 token 粘贴到 API_TOKEN= 后面');
console.log('   - 保存文件');
console.log('');

// 显示当前 .env 文件内容
if (fs.existsSync(envPath)) {
  console.log('? 当前 .env 文件内容：');
  console.log('------------------------');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
  console.log('');
}

console.log('? 提示：');
console.log('- Token 格式：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('- 如果 token 过期，需要重新登录获取');
console.log('- 确保 My-Day 后端服务器正在运行');
console.log('');
console.log('? 配置完成后启动 MCP 服务器：');
console.log('npm install');
console.log('npm run build');
console.log('npm start');
console.log('');
console.log('? 测试 MCP 服务器：');
console.log('node demo.js'); 