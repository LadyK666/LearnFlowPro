#!/usr/bin/env node

import { TokenManager } from '../src/utils/TokenManager.js';

const tokenManager = new TokenManager();

// 获取命令行参数
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('❌ 请提供JWT Token');
  console.log('');
  console.log('使用方法:');
  console.log('  node scripts/set-token.js "你的JWT Token"');
  console.log('');
  console.log('示例:');
  console.log('  node scripts/set-token.js "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."');
  console.log('');
  console.log('💡 如何获取JWT Token:');
  console.log('  1. 在浏览器中打开My-Day应用');
  console.log('  2. 登录你的账号');
  console.log('  3. 按F12打开开发者工具');
  console.log('  4. 点击Application标签');
  console.log('  5. 在左侧找到Local Storage');
  console.log('  6. 点击你的网站域名');
  console.log('  7. 找到token键，复制对应的值');
  process.exit(1);
}

const token = args[0];

// 验证Token格式
if (!tokenManager.isTokenValid(token)) {
  console.log('❌ 无效的JWT Token格式');
  console.log('Token应该以"eyJ"开头，并且长度超过100个字符');
  process.exit(1);
}

// 保存Token
tokenManager.saveToken(token);

console.log('✅ Token设置成功!');
console.log('');
console.log('📁 Token文件位置:', tokenManager.getTokenPath());
console.log('');
console.log('🚀 现在可以启动网络服务器了:');
console.log('   npm run dev');
console.log('');
console.log('🔍 服务器启动后，可以访问以下端点:');
console.log('   http://localhost:3001/health     - 健康检查');
console.log('   http://localhost:3001/tools      - 工具列表');
console.log('   http://localhost:3001/docs       - API文档'); 