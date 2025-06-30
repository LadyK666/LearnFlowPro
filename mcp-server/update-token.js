const fs = require('fs');
const path = require('path');

console.log('? JWT Token ���¹���');
console.log('=====================');
console.log('');

// ��ȡ��ǰ��taskManager.ts�ļ�
const taskManagerPath = path.join(__dirname, 'src', 'taskManager.ts');
let content = fs.readFileSync(taskManagerPath, 'utf8');

// ��ʾ��ǰ��token
const currentTokenMatch = content.match(/this\.token = '([^']+)'/);
if (currentTokenMatch) {
  console.log('��ǰToken:', currentTokenMatch[1]);
  console.log('');
}

console.log('? ��ȡ��Token�Ĳ��裺');
console.log('1. �����������: http://localhost:5174/');
console.log('2. ȷ���ѵ�¼My-DayӦ��');
console.log('3. ��F12�򿪿����߹���');
console.log('4. ���Application -> Local Storage -> http://localhost:5174');
console.log('5. �ҵ�token����������ֵ');
console.log('');

// �������в�����ȡ��token
const newToken = process.argv[2];

if (!newToken) {
  console.log('? ���ṩ�µ�JWT Token');
  console.log('ʹ�÷���: node update-token.js "�����token"');
  console.log('');
  console.log('ʾ��:');
  console.log('node update-token.js "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."');
  process.exit(1);
}

// ��֤token��ʽ
if (!newToken.startsWith('eyJ')) {
  console.log('? Token��ʽ����ȷ��Ӧ����"eyJ"��ͷ');
  process.exit(1);
}

// �滻token
const newContent = content.replace(
  /this\.token = '[^']+'/,
  `this.token = '${newToken}'`
);

// д���ļ�
fs.writeFileSync(taskManagerPath, newContent);

console.log('? Token�Ѹ��£�');
console.log('');

// ���¹�����Ŀ
console.log('? �������¹�����Ŀ...');
const { execSync } = require('child_process');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('? ������ɣ�');
  console.log('');
  console.log('? ���ڿ�������Claude Desktop��ʹ���µ�Token��');
} catch (error) {
  console.log('? ����ʧ��:', error.message);
} 