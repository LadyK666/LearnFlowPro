import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/tasks';
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import categoryMigrationTimer from './utils/categoryTimer';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// 启动类别迁移定时器
console.log('正在启动类别迁移定时器...');
categoryMigrationTimer.start();

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  categoryMigrationTimer.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('正在关闭服务器...');
  categoryMigrationTimer.stop();
  process.exit(0);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log('类别迁移定时器已启动，每30秒检查一次任务类别');
});
