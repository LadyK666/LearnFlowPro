import { migrateAllTaskCategories, getCategoryStatistics } from './categoryMigration';

class CategoryMigrationTimer {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastRunTime: Date | null = null;
  private runCount: number = 0;

  constructor(private intervalMs: number = 30000) {} // 默认30秒

  // 启动定时器
  start(): void {
    if (this.isRunning) {
      console.log('类别迁移定时器已经在运行中');
      return;
    }

    console.log(`启动类别迁移定时器，间隔: ${this.intervalMs / 1000}秒`);
    this.isRunning = true;
    this.lastRunTime = new Date();

    // 立即执行一次
    this.executeMigration();

    // 设置定时器
    this.intervalId = setInterval(() => {
      this.executeMigration();
    }, this.intervalMs);
  }

  // 停止定时器
  stop(): void {
    if (!this.isRunning) {
      console.log('类别迁移定时器未在运行');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('类别迁移定时器已停止');
  }

  // 执行迁移
  private async executeMigration(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] 执行第 ${++this.runCount} 次类别迁移检查`);
      
      const result = await migrateAllTaskCategories();
      
      if (result.success) {
        if (result.updatedCount && result.updatedCount > 0) {
          console.log(`✅ 迁移成功: 更新了 ${result.updatedCount} 个任务类别`);
        } else {
          console.log(`✅ 检查完成: 所有任务类别都是正确的`);
        }
      } else {
        console.error(`❌ 迁移失败: ${result.error}`);
      }

      this.lastRunTime = new Date();
    } catch (error) {
      console.error(`❌ 迁移执行出错:`, error);
    }
  }

  // 获取定时器状态
  getStatus(): {
    isRunning: boolean;
    lastRunTime: Date | null;
    runCount: number;
    intervalMs: number;
  } {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      runCount: this.runCount,
      intervalMs: this.intervalMs
    };
  }

  // 手动触发一次迁移
  async triggerManualMigration(): Promise<void> {
    console.log('手动触发类别迁移');
    await this.executeMigration();
  }

  // 设置新的间隔时间
  setInterval(intervalMs: number): void {
    if (this.isRunning) {
      this.stop();
      this.intervalMs = intervalMs;
      this.start();
    } else {
      this.intervalMs = intervalMs;
    }
    console.log(`类别迁移定时器间隔已更新为: ${intervalMs / 1000}秒`);
  }
}

// 创建全局定时器实例
const categoryMigrationTimer = new CategoryMigrationTimer();

export default categoryMigrationTimer; 