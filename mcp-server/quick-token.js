const fs = require('fs');
const path = require('path');

console.log('? ����Token���¹���');
console.log('===================');
console.log('');

const tokenPath = path.join(__dirname, 'token.txt');

// �������в�����ȡtoken
const newToken = process.argv[2];

if (!newToken) {
  console.log('? ���ṩJWT Token');
  console.log('');
  console.log('? ��ȡToken���裺');
  console.log('1. �����������: http://localhost:5174/');
  console.log('2. ȷ���ѵ�¼My-DayӦ��');
  console.log('3. ��F12�򿪿����߹���');
  console.log('4. ���Application -> Local Storage -> http://localhost:5174');
  console.log('5. �ҵ�token����������ֵ');
  console.log('');
  console.log('? ʹ�÷���:');
  console.log('node quick-token.js "���token"');
  console.log('');
  console.log('ʾ��:');
  console.log('node quick-token.js "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."');
  process.exit(1);
}

// ��֤token��ʽ
if (!newToken.startsWith('eyJ')) {
  console.log('? Token��ʽ����ȷ��Ӧ����"eyJ"��ͷ');
  process.exit(1);
}

// ����token���ļ�
try {
  fs.writeFileSync(tokenPath, newToken);
  console.log('? Token�ѱ��浽 token.txt �ļ�');
  console.log('');
  console.log('? ����MCP���������Զ�ʹ�����Token');
  console.log('? ���Token���ڣ�ֻ���������д������');
} catch (error) {
  console.log('? ����Tokenʧ��:', error.message);
  process.exit(1);
} 