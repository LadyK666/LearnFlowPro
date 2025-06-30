const fs = require('fs');
const path = require('path');

console.log('? 快速Token更新工具');
console.log('===================');
console.log('');

const tokenPath = path.join(__dirname, 'token.txt');

// 从命令行参数获取token
const newToken = process.argv[2];

if (!newToken) {
  console.log('? 请提供JWT Token');
  console.log('');
  console.log('? 获取Token步骤：');
  console.log('1. 打开浏览器访问: http://localhost:5174/');
  console.log('2. 确保已登录My-Day应用');
  console.log('3. 按F12打开开发者工具');
  console.log('4. 点击Application -> Local Storage -> http://localhost:5174');
  console.log('5. 找到token键，复制其值');
  console.log('');
  console.log('? 使用方法:');
  console.log('node quick-token.js "你的token"');
  console.log('');
  console.log('示例:');
  console.log('node quick-token.js "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."');
  process.exit(1);
}

// 验证token格式
if (!newToken.startsWith('eyJ')) {
  console.log('? Token格式不正确，应该以"eyJ"开头');
  process.exit(1);
}

// 保存token到文件
try {
  fs.writeFileSync(tokenPath, newToken);
  console.log('? Token已保存到 token.txt 文件');
  console.log('');
  console.log('? 现在MCP服务器会自动使用这个Token');
  console.log('? 如果Token过期，只需重新运行此命令即可');
} catch (error) {
  console.log('? 保存Token失败:', error.message);
  process.exit(1);
} 