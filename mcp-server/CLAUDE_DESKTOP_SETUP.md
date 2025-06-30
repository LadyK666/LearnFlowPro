# Claude Desktop MCP ����ָ��

## ����һ��ֱ�ӱ༭�����ļ�

### 1. �ҵ� Claude Desktop �����ļ�

Claude Desktop �������ļ�ͨ��λ������λ�ã�

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### 2. �༭�����ļ�

�� `claude_desktop_config.json` �ļ�������������ã�

```json
{
  "mcpServers": {
    "my-day-tasks": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "D:/Desktop/����γ�/����ʵѵ/my-day - ����/mcp-server",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**����˵����**
- `command`: ִ�����node��
- `args`: �����в�����ָ�������index.js�ļ���
- `cwd`: ����Ŀ¼��MCP����������·����
- `env`: ������������

### 3. ·������˵��

��������ʵ��·���޸� `cwd` �ֶΣ�

**Windows ʾ����**
```json
"cwd": "D:/Desktop/����γ�/����ʵѵ/my-day - ����/mcp-server"
```

**macOS/Linux ʾ����**
```json
"cwd": "/Users/username/Projects/my-day/mcp-server"
```

## ��������ͨ�� Claude Desktop ��������

### 1. �� Claude Desktop ����

1. ���� Claude Desktop
2. ������Ͻǵ�����ͼ�꣨����ͼ�꣩
3. ѡ�� "Settings" �� "Preferences"

### 2. �ҵ�������ѡ��

1. ������ҳ�����ҵ� "Developer" �� "������" ѡ��
2. ������뿪��������

### 3. ��� MCP ������

1. �ҵ� "MCP Servers" �� "MCP ������" ����
2. ��� "Add Server" �� "��ӷ�����"
3. ��д������Ϣ��
   - **Name**: My-Day Tasks
   - **Command**: node
   - **Arguments**: dist/index.js
   - **Working Directory**: ���MCP������·��
   - **Environment Variables**: NODE_ENV=production

## ����ǰ��׼������

### 1. ȷ�� MCP �������ѹ���

```bash
cd mcp-server
npm run build
```

### 2. ȷ����������������

```bash
cp env.example .env
# �༭ .env �ļ������� API_TOKEN �Ȳ���
```

### 3. ��ȡ JWT Token

�ο� `README.md` �е� "��ȡ API Token" ���֡�

## ��֤����

### 1. ���� Claude Desktop

������ɺ����� Claude Desktop Ӧ�á�

### 2. ��������

�� Claude Desktop �г������¶Ի���

```
�û�: "���Ҳ鿴��������"
```

���������ȷ��Claude Ӧ���ܹ�ʹ�� MCP ��������ȡ������Ϣ��

## �����ų�

### ��������

1. **·������**
   - ȷ�� `cwd` ·����ȷ
   - ʹ�þ���·�����������·��
   - Windows ·��ʹ����б�� `/` ��˫��б�� `\\`

2. **�ļ�������**
   - ȷ���Ѿ����� `npm run build`
   - ��� `dist/index.js` �ļ��Ƿ����

3. **Ȩ������**
   - ȷ����ִ��Ȩ��
   - ����ļ�·��Ȩ��

4. **������������**
   - ȷ�� `.env` �ļ�������ȷ
   - ��� API_TOKEN �Ƿ���Ч

### ���Է���

1. **�鿴��־**
   - �� MCP ������Ŀ¼���� `npm start` �鿴���
   - ����Ƿ��д�����Ϣ

2. **���� API ����**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/tasks
   ```

3. **���˿�ռ��**
   ```bash
   netstat -an | findstr :4000
   ```

## ��������ʾ��

```json
{
  "mcpServers": {
    "my-day-tasks": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "D:/Desktop/����γ�/����ʵѵ/my-day - ����/mcp-server",
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "otherSettings": {
    // ���� Claude Desktop ����
  }
}
```

## ע������

1. **·����ʽ**: Windows ·������ʹ����б�� `/`
2. **Ȩ��**: ȷ�� Claude Desktop �з��� MCP ������Ŀ¼��Ȩ��
3. **����ǽ**: ȷ������ǽ������ض˿ڷ���
4. **�汾����**: ȷ�� Node.js �汾���ݣ����� 18+��

## ��������

�����Ҫ�������ã�

1. ֹͣ Claude Desktop
2. �༭�����ļ�
3. ���� Claude Desktop

���ø��Ļ�������Ч�� 