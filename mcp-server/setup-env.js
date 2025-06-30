const fs = require('fs');
const path = require('path');

console.log('? My-Day MCP 服务器环境配置工具');
console.log('=====================================');
console.log('');

// 检查.env文件是否存在
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (fs.existsSync(envPath)) {
  console.log('? .env 文件已存在');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('当前配置:');
  console.log(envContent);
} else {
  console.log('? .env 文件不存在，正在创建...');
  
  if (fs.existsSync(envExamplePath)) {
    const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, exampleContent);
    console.log('? 已从 env.example 创建 .env 文件');
  } else {
    console.log('? env.example 文件不存在');
    process.exit(1);
  }
}

console.log('');
console.log('? 下一步操作：');
console.log('1. 编辑 .env 文件中的 API_TOKEN');
console.log('2. 确保后端服务器正在运行 (npm run dev)');
console.log('3. 重启 Claude Desktop');
console.log('');
console.log('? 获取新的 API_TOKEN:');
console.log('- 登录 My-Day 应用');
console.log('- 按 F12 打开开发者工具');
console.log('- 在 Application -> Local Storage 中找到 token');
console.log('- 复制 token 值到 .env 文件'); 