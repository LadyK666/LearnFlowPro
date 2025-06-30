import { Router, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { migrateAllTaskCategories } from '../utils/categoryMigration';
import categoryMigrationTimer from '../utils/categoryTimer';

const router = Router();
const prisma = new PrismaClient();

// 类别映射函数 - 统一将中文类别转换为英文
const mapCategory = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    '学习': 'learning',
    '工作': 'work',
    '个人': 'personal',
    '健康': 'health',
    '购物': 'shopping',
    '其他': 'other',
    // 处理可能的拼写错误
    'lreaning': 'learning',
    'learing': 'learning',
    'work': 'work',
    'personal': 'personal',
    'health': 'health',
    'shopping': 'shopping',
    'other': 'other',
    'learning': 'learning'
  };
  
  // 如果类别已经是英文，直接返回
  if (Object.values(categoryMap).includes(category)) {
    return category;
  }
  
  // 如果是中文，进行映射
  return categoryMap[category] || 'other';
};

// Apply the authentication middleware to all routes in this file
router.use(authenticateToken);

// GET /api/tasks - Get all tasks for the logged-in user
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  try {
    const { sortBy, order } = req.query;

    let orderBy: Prisma.taskOrderByWithRelationInput[] = [
      { completed: 'asc' },   // 1. Incomplete tasks first
      { priority: 'desc' },    // 2. Then by priority high to low
      { todayOrder: 'asc' },   // 3. Then by manual order on Today page
      { createdAt: 'desc' }   // 4. Finally by creation time
    ];

    // This allows the TaskPoolPage to override the default sorting
    if (typeof sortBy === 'string' && (sortBy === 'createdAt' || sortBy === 'priority' || sortBy === 'title')) {
        const direction = order === 'asc' ? 'asc' : 'desc';
        orderBy = [{ [sortBy]: direction }];
    }

    const tasks = await prisma.task.findMany({
      where: { authorId: userId },
      orderBy: orderBy,
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '无法获取任务' });
  }
});

// POST /api/tasks/reorder - Reorder tasks for Today page
router.post('/reorder', async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { orderedTasks } = req.body as { orderedTasks: { id: number; todayOrder: number }[] };

  if (!orderedTasks || !Array.isArray(orderedTasks)) {
    return res.status(400).json({ error: '无效的任务顺序数据' });
  }

  try {
    const updatePromises = orderedTasks.map(task =>
      prisma.task.update({
        where: { id: task.id, authorId: userId },
        data: { todayOrder: task.todayOrder },
      })
    );

    await prisma.$transaction(updatePromises);
    res.status(200).json({ message: '任务顺序已更新' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '无法更新任务顺序' });
  }
});

// GET /api/tasks/:id - Get a single task
router.get('/:id', async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id), authorId: userId },
    });
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: '任务未找到' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '无法获取任务' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未授权' });
  }

  const userId = req.user.userId;
  const { title, description, priority, category, isToday } = req.body;

  if (!title || priority === undefined || !category) {
    return res.status(400).json({ error: '缺少必填字段' });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority: Number(priority),  // 确保是数字
        category: mapCategory(category),
        isToday: isToday ?? false,  // nullish 合并，更准确
        authorId: userId,
        updatedAt: new Date(),
      },
    });
    
    // 异步执行类别迁移，不阻塞响应
    migrateAllTaskCategories().catch(error => {
      console.error('类别迁移失败:', error);
    });
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ error: '无法创建任务' });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      category, 
      priority, 
      completed, 
      isToday,
      completedAt 
    } = req.body;

    const dataToUpdate: Prisma.taskUpdateInput = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (category !== undefined) dataToUpdate.category = mapCategory(category);
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (completed !== undefined) dataToUpdate.completed = completed;
    if (isToday !== undefined) dataToUpdate.isToday = isToday;
    if (completedAt !== undefined) dataToUpdate.completedAt = completedAt;
    
    // Handle assigning todayOrder when a task is moved to Today
    if (dataToUpdate.isToday === true && dataToUpdate.completed !== true) {
      const maxOrder = await prisma.task.aggregate({
        _max: { todayOrder: true },
        where: { isToday: true, authorId: userId },
      });
      dataToUpdate.todayOrder = (maxOrder._max.todayOrder ?? 0) + 1;
    }
    
    // Handle removing todayOrder when a task is moved from Today
    if (dataToUpdate.isToday === false) {
      dataToUpdate.todayOrder = null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id), authorId: userId },
      data: dataToUpdate,
    });
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '无法更新任务' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  try {
    const { id } = req.params;
    await prisma.task.delete({
      where: { id: parseInt(id), authorId: userId },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '无法删除任务' });
  }
});

// POST /api/tasks/import - Bulk import tasks, replacing existing ones
router.post('/import', async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  try {
    const { tasks } = req.body as { tasks: any[] };

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: '无效的导入数据' });
    }

    // Sanitize and prepare data for import
    const sanitizedTasks = tasks.map(task => ({
        title: task.title,
        description: task.description,
        category: mapCategory(task.category),
        priority: task.priority,
        completed: task.completed,
        isToday: task.isToday,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        authorId: userId,
    }));
    
    // Using a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing tasks for the user
      await tx.task.deleteMany({
        where: { authorId: userId },
      });

      // 2. Create new tasks from the imported data
      await tx.task.createMany({
        data: sanitizedTasks,
      });
    });

    res.status(201).json({ message: `成功导入 ${sanitizedTasks.length} 个任务` });

  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if necessary
        return res.status(400).json({ error: '导入数据格式与数据库不匹配' });
    }
    res.status(500).json({ error: '无法导入任务' });
  }
});

// DELETE /api/tasks/all - Delete all tasks for a user
router.delete('/all', async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  try {
    await prisma.task.deleteMany({
      where: { authorId: userId },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '无法清空任务' });
  }
});

// POST /api/tasks/reset-daily - Checks if it's a new day for the user and deletes completed tasks.
router.post('/reset-daily', async (req: AuthRequest, res) => {
  const userId = req.user!.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // This case should theoretically not be reached if authenticateToken works correctly
      return res.status(404).json({ error: '用户未找到' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight

    // Check if the last reset was before today
    if (!user.lastLoginDate || new Date(user.lastLoginDate) < today) {
      console.log(`New day detected for user ${userId}. Running daily reset...`);

      // 1. Delete completed tasks from the previous day(s)
      const result = await prisma.task.deleteMany({
        where: {
          authorId: userId,
          isToday: true,
          completed: true,
        },
      });

      // 2. Update the user's last login date to now
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginDate: new Date() },
      });
      
      console.log(`Deleted ${result.count} completed tasks.`);
      return res.status(200).json({ 
        message: 'Daily reset completed successfully.',
        deletedCount: result.count 
      });
    } else {
      console.log('Daily reset not needed for today.');
      // It's the same day, no action needed
      return res.status(200).json({ 
        message: 'Daily reset already performed for today.',
        deletedCount: 0
      });
    }
  } catch (error) {
    console.error('Error during daily reset:', error);
    res.status(500).json({ error: '无法执行每日重置' });
  }
});

// GET /api/tasks/timer-status - 获取定时器状态
router.get('/timer-status', async (req: AuthRequest, res) => {
  try {
    const status = categoryMigrationTimer.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('获取定时器状态失败:', error);
    res.status(500).json({ 
      success: false,
      error: '获取定时器状态失败' 
    });
  }
});

// POST /api/tasks/timer/start - 启动定时器
router.post('/timer/start', async (req: AuthRequest, res) => {
  try {
    categoryMigrationTimer.start();
    res.json({
      success: true,
      message: '类别迁移定时器已启动'
    });
  } catch (error) {
    console.error('启动定时器失败:', error);
    res.status(500).json({ 
      success: false,
      error: '启动定时器失败' 
    });
  }
});

// POST /api/tasks/timer/stop - 停止定时器
router.post('/timer/stop', async (req: AuthRequest, res) => {
  try {
    categoryMigrationTimer.stop();
    res.json({
      success: true,
      message: '类别迁移定时器已停止'
    });
  } catch (error) {
    console.error('停止定时器失败:', error);
    res.status(500).json({ 
      success: false,
      error: '停止定时器失败' 
    });
  }
});

// POST /api/tasks/timer/trigger - 手动触发一次迁移
router.post('/timer/trigger', async (req: AuthRequest, res) => {
  try {
    await categoryMigrationTimer.triggerManualMigration();
    res.json({
      success: true,
      message: '手动迁移已触发'
    });
  } catch (error) {
    console.error('手动触发迁移失败:', error);
    res.status(500).json({ 
      success: false,
      error: '手动触发迁移失败' 
    });
  }
});

// PUT /api/tasks/timer/interval - 设置定时器间隔
router.put('/timer/interval', async (req: AuthRequest, res) => {
  try {
    const { intervalMs } = req.body;
    
    if (!intervalMs || typeof intervalMs !== 'number' || intervalMs < 1000) {
      return res.status(400).json({
        success: false,
        error: '间隔时间必须是大于1000毫秒的数字'
      });
    }
    
    categoryMigrationTimer.setInterval(intervalMs);
    res.json({
      success: true,
      message: `定时器间隔已设置为 ${intervalMs / 1000} 秒`
    });
  } catch (error) {
    console.error('设置定时器间隔失败:', error);
    res.status(500).json({ 
      success: false,
      error: '设置定时器间隔失败' 
    });
  }
});

export default router;
