const fs = require('fs');
const path = require('path');

console.log('? My-Day MCP �������������ù���');
console.log('=====================================');
console.log('');

// ���.env�ļ��Ƿ����
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (fs.existsSync(envPath)) {
  console.log('? .env �ļ��Ѵ���');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('��ǰ����:');
  console.log(envContent);
} else {
  console.log('? .env �ļ������ڣ����ڴ���...');
  
  if (fs.existsSync(envExamplePath)) {
    const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, exampleContent);
    console.log('? �Ѵ� env.example ���� .env �ļ�');
  } else {
    console.log('? env.example �ļ�������');
    process.exit(1);
  }
}

console.log('');
console.log('? ��һ��������');
console.log('1. �༭ .env �ļ��е� API_TOKEN');
console.log('2. ȷ����˷������������� (npm run dev)');
console.log('3. ���� Claude Desktop');
console.log('');
console.log('? ��ȡ�µ� API_TOKEN:');
console.log('- ��¼ My-Day Ӧ��');
console.log('- �� F12 �򿪿����߹���');
console.log('- �� Application -> Local Storage ���ҵ� token');
console.log('- ���� token ֵ�� .env �ļ�'); 