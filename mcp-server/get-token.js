#!/usr/bin/env node

/**
 * ���ٻ�ȡ My-Day JWT Token �Ľű�
 */

const fs = require('fs');
const path = require('path');

console.log('? My-Day JWT Token ��ȡ����');
console.log('============================');
console.log('');

// ����Ƿ�����ȷ��Ŀ¼
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envExamplePath)) {
  console.error('? �Ҳ��� env.example �ļ�����ȷ���� mcp-server Ŀ¼�����д˽ű�');
  process.exit(1);
}

// ��� .env �ļ������ڣ���ʾ���ļ�����
if (!fs.existsSync(envPath)) {
  console.log('? ���� .env �ļ�...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('? .env �ļ��Ѵ���');
}

console.log('? ��ȡ JWT Token ����ϸ���裺');
console.log('');
console.log('1. ? ���� My-Day Ӧ��');
console.log('   - ȷ����˷������������� (�˿� 4000)');
console.log('   - ����ǰ��Ӧ�� (ͨ���� npm run dev)');
console.log('   - ��������з���Ӧ��');
console.log('');
console.log('2. ? ��¼Ӧ��');
console.log('   - ʹ������˺ŵ�¼ My-Day Ӧ��');
console.log('   - ȷ����¼�ɹ�');
console.log('');
console.log('3. ? �򿪿����߹���');
console.log('   - �� F12 ��');
console.log('   - �����Ҽ����ҳ�� -> ���');
console.log('');
console.log('4. ? �ҵ� Local Storage');
console.log('   - ��� "Application" ��ǩ');
console.log('   - ������ҵ� "Local Storage"');
console.log('   - ��������վ����');
console.log('');
console.log('5. ? ���� Token');
console.log('   - �ҵ� "token" ��');
console.log('   - ���ƶ�Ӧ��ֵ�����ַ������� eyJ ��ͷ��');
console.log('');
console.log('6. ?? ���� Token');
console.log('   - �� mcp-server/.env �ļ�');
console.log('   - �� token ճ���� API_TOKEN= ����');
console.log('   - �����ļ�');
console.log('');

// ��ʾ��ǰ .env �ļ�����
if (fs.existsSync(envPath)) {
  console.log('? ��ǰ .env �ļ����ݣ�');
  console.log('------------------------');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
  console.log('');
}

console.log('? ��ʾ��');
console.log('- Token ��ʽ��eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('- ��� token ���ڣ���Ҫ���µ�¼��ȡ');
console.log('- ȷ�� My-Day ��˷�������������');
console.log('');
console.log('? ������ɺ����� MCP ��������');
console.log('npm install');
console.log('npm run build');
console.log('npm start');
console.log('');
console.log('? ���� MCP ��������');
console.log('node demo.js'); 