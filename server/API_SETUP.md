# AI API ����˵��

## ����API����

Ϊ��ʹ��AI���칦�ܣ�����Ҫ���ù���API��Կ��

### 1. ��ȡAPI��Կ

1. ���� [��������](https://www.siliconflow.cn/)
2. ע�Ტ��¼�˻�
3. �ڿ���̨�л�ȡAPI��Կ

### 2. ���û�������

�� `server` Ŀ¼�´��� `.env` �ļ�������������ݣ�

```env
# ���ݿ�����
DATABASE_URL="mysql://root:123456@localhost:3306/AI2"

# JWT��Կ
JWT_SECRET="your-jwt-secret-key-here"

# ����API����
SILICONFLOW_API_KEY="your-siliconflow-api-key-here"
```

### 3. ֧�ֵ�ģ��

����API֧������ģ�ͣ�

- `Qwen/Qwen2.5-VL-72B-Instruct` - 72B�Ӿ�����ģ��
- `Qwen/Qwen2.5-72B-Instruct` - 72Bָ��ģ��
- `Qwen/Qwen2.5-14B-Instruct` - 14Bָ��ģ��
- `Qwen/Qwen2.5-7B-Instruct` - 7Bָ��ģ��
- `Qwen/Qwen2.5-1.5B-Instruct` - 1.5Bָ��ģ��
- `Qwen/Qwen2.5-0.5B-Instruct` - 0.5Bָ��ģ��

### 4. ����������

������ɺ�������������

```bash
cd server
npm run dev
```

### ע������

- ��ȷ��API��Կ�İ�ȫ�ԣ���Ҫ�����ύ���汾����ϵͳ
- ���API����ʧ�ܣ�ϵͳ���Զ����˵�ģ��ظ�
- ����������������ʹ�ø���ȫ����Կ����ʽ 