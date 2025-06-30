import { PrismaClient } from '@prisma/client';

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

// 迁移所有任务的类别为英文
export async function migrateAllTaskCategories() {
  try {
    console.log('开始迁移任务类别...');
    
    // 获取所有任务
    const allTasks = await prisma.task.findMany({
      select: {
        id: true,
        category: true,
        title: true
      }
    });
    
    console.log(`找到 ${allTasks.length} 个任务`);
    
    let updatedCount = 0;
    let unchangedCount = 0;
    
    // 遍历每个任务
    for (const task of allTasks) {
      const originalCategory = task.category;
      const newCategory = mapCategory(originalCategory);
      
      // 如果类别需要更新
      if (originalCategory !== newCategory) {
        await prisma.task.update({
          where: { id: task.id },
          data: { category: newCategory }
        });
        
        console.log(`任务 "${task.title}" (ID: ${task.id}): ${originalCategory} -> ${newCategory}`);
        updatedCount++;
      } else {
        unchangedCount++;
      }
    }
    
    console.log(`迁移完成！`);
    console.log(`- 更新的任务: ${updatedCount} 个`);
    console.log(`- 无需更新的任务: ${unchangedCount} 个`);
    
    return {
      success: true,
      totalTasks: allTasks.length,
      updatedCount,
      unchangedCount
    };
    
  } catch (error) {
    console.error('迁移任务类别时出错:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 获取类别统计信息
export async function getCategoryStatistics() {
  try {
    const categoryStats = await prisma.task.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    
    console.log('当前数据库中的类别统计:');
    categoryStats.forEach(stat => {
      console.log(`- ${stat.category}: ${stat._count.category} 个任务`);
    });
    
    return categoryStats;
  } catch (error) {
    console.error('获取类别统计时出错:', error);
    return null;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  (async () => {
    console.log('=== 任务类别迁移工具 ===');
    
    // 显示迁移前的统计
    console.log('\n迁移前的类别统计:');
    await getCategoryStatistics();
    
    // 执行迁移
    console.log('\n开始执行迁移...');
    const result = await migrateAllTaskCategories();
    
    if (result.success) {
      console.log('\n迁移后的类别统计:');
      await getCategoryStatistics();
    }
    
    await prisma.$disconnect();
  })();
} 