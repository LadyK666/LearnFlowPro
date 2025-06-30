# 任务类别迁移工具

## 问题描述

在数据库中发现任务类别存在混合语言的问题：
- 部分任务使用中文类别（如：学习、工作、其他）
- 部分任务使用英文类别（如：learning、work、other）
- 还有拼写错误的类别（如：lreaning）

这导致了数据不一致和前端显示问题。

## 解决方案

### 1. 自动映射机制

在任务创建和更新时，系统会自动将中文类别映射为英文：

```typescript
const categoryMap = {
  '学习': 'learning',
  '工作': 'work', 
  '个人': 'personal',
  '健康': 'health',
  '购物': 'shopping',
  '其他': 'other',
  // 处理拼写错误
  'lreaning': 'learning',
  'learing': 'learning'
};
```

### 2. 迁移工具

提供了多种方式来执行类别迁移：

#### 方式一：通过前端界面
1. 登录应用
2. 进入"设置"页面
3. 在"数据库维护"部分点击"执行迁移"按钮
4. 系统会显示迁移结果

#### 方式二：通过API接口
```bash
POST /api/tasks/migrate-categories
Authorization: Bearer <token>
```

#### 方式三：通过命令行脚本
```bash
cd server
node migrate-categories.js
```

### 3. 迁移脚本功能

- 显示迁移前的类别统计
- 遍历所有任务并更新类别
- 显示详细的迁移日志
- 显示迁移后的类别统计
- 错误处理和回滚机制

## 使用方法

### 立即执行迁移

1. **前端界面**（推荐）：
   - 打开应用设置页面
   - 点击"执行迁移"按钮
   - 等待迁移完成

2. **命令行**：
   ```bash
   cd server
   node migrate-categories.js
   ```

### 验证迁移结果

迁移完成后，所有任务的类别都会统一为英文：
- learning（学习）
- work（工作）
- personal（个人）
- health（健康）
- shopping（购物）
- other（其他）

## 预防措施

1. **前端验证**：在任务创建时，前端只允许选择英文类别
2. **后端映射**：在任务创建和更新时，自动将中文映射为英文
3. **定期检查**：可以定期运行迁移脚本来确保数据一致性

## 注意事项

- 迁移操作是安全的，不会丢失任务数据
- 迁移过程会显示详细的日志信息
- 如果迁移失败，会显示具体的错误信息
- 建议在迁移前备份数据库

## 技术实现

### 核心文件

- `server/src/utils/categoryMigration.ts` - TypeScript迁移工具
- `server/migrate-categories.js` - Node.js迁移脚本
- `server/src/routes/tasks.ts` - 任务路由（包含映射逻辑）
- `src/pages/SettingsPage.tsx` - 前端迁移界面

### 映射逻辑

```typescript
const mapCategory = (category: string): string => {
  const categoryMap = { /* 映射表 */ };
  
  // 如果已经是英文，直接返回
  if (Object.values(categoryMap).includes(category)) {
    return category;
  }
  
  // 如果是中文，进行映射
  return categoryMap[category] || 'other';
};
```

这个解决方案确保了：
1. 历史数据得到修复
2. 新数据保持一致性
3. 用户友好的操作界面
4. 完善的错误处理机制 