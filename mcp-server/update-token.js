const fs = require('fs');
const path = require('path');

console.log('? JWT Token 更新工具');
console.log('=====================');
console.log('');

// 读取当前的taskManager.ts文件
const taskManagerPath = path.join(__dirname, 'src', 'taskManager.ts');
let content = fs.readFileSync(taskManagerPath, 'utf8');

// 显示当前的token
const currentTokenMatch = content.match(/this\.token = '([^']+)'/);
if (currentTokenMatch) {
  console.log('当前Token:', currentTokenMatch[1]);
  console.log('');
}

console.log('? 获取新Token的步骤：');
console.log('1. 打开浏览器访问: http://localhost:5174/');
console.log('2. 确保已登录My-Day应用');
console.log('3. 按F12打开开发者工具');
console.log('4. 点击Application -> Local Storage -> http://localhost:5174');
console.log('5. 找到token键，复制其值');
console.log('');

// 从命令行参数获取新token
const newToken = process.argv[2];

if (!newToken) {
  console.log('? 请提供新的JWT Token');
  console.log('使用方法: node update-token.js "你的新token"');
  console.log('');
  console.log('示例:');
  console.log('node update-token.js "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."');
  process.exit(1);
}

// 验证token格式
if (!newToken.startsWith('eyJ')) {
  console.log('? Token格式不正确，应该以"eyJ"开头');
  process.exit(1);
}

// 替换token
const newContent = content.replace(
  /this\.token = '[^']+'/,
  `this.token = '${newToken}'`
);

// 写回文件
fs.writeFileSync(taskManagerPath, newContent);

console.log('? Token已更新！');
console.log('');

// 重新构建项目
console.log('? 正在重新构建项目...');
const { execSync } = require('child_process');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('? 构建完成！');
  console.log('');
  console.log('? 现在可以重启Claude Desktop来使用新的Token了');
} catch (error) {
  console.log('? 构建失败:', error.message);
} 