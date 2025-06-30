import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Task, TaskCategory, Priority } from '../types';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface TaskConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskAccepted: (task: Task) => void;
  onTaskRejected: () => void;
}

// 中文类别到英文枚举值的映射
const categoryMapping: Record<string, TaskCategory> = {
  '工作': TaskCategory.WORK,
  '个人': TaskCategory.PERSONAL,
  '健康': TaskCategory.HEALTH,
  '学习': TaskCategory.LEARNING,
  '购物': TaskCategory.SHOPPING,
  '其他': TaskCategory.OTHER,
  // 英文值直接映射
  'work': TaskCategory.WORK,
  'personal': TaskCategory.PERSONAL,
  'health': TaskCategory.HEALTH,
  'learning': TaskCategory.LEARNING,
  'shopping': TaskCategory.SHOPPING,
  'other': TaskCategory.OTHER,
};

// 英文枚举值到中文显示名称的映射
const categoryDisplayNames: Record<TaskCategory, string> = {
  [TaskCategory.WORK]: '工作',
  [TaskCategory.PERSONAL]: '个人',
  [TaskCategory.HEALTH]: '健康',
  [TaskCategory.LEARNING]: '学习',
  [TaskCategory.SHOPPING]: '购物',
  [TaskCategory.OTHER]: '其他',
};

const TaskConfirmationDialog: React.FC<TaskConfirmationDialogProps> = ({
  isOpen,
  onClose,
  task,
  onTaskAccepted,
  onTaskRejected
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  // 当对话框打开时，初始化编辑的任务数据
  React.useEffect(() => {
    if (task && isOpen) {
      // 处理category字段，将中文转换为英文枚举值
      const normalizedCategory = categoryMapping[task.category] || TaskCategory.OTHER;
      setEditedTask({ 
        ...task, 
        category: normalizedCategory 
      });
    }
  }, [task, isOpen]);

  const handleAccept = async () => {
    if (!editedTask) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }

      // 更新任务
      const response = await axios.put(`${API_URL}/ai/tasks/${editedTask.id}`, {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        category: editedTask.category,
        isToday: editedTask.isToday
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('任务已采纳并更新');
      onTaskAccepted(response.data);
      onClose();
    } catch (error: any) {
      console.error('更新任务失败:', error);
      toast.error(error.response?.data?.error || '更新任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!task) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录');
      }

      // 删除任务
      await axios.delete(`${API_URL}/ai/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('任务已放弃');
      onTaskRejected();
      onClose();
    } catch (error: any) {
      console.error('删除任务失败:', error);
      toast.error(error.response?.data?.error || '删除任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!task || !editedTask) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>确认AI创建的任务</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              AI为您创建了一个新任务，请确认是否采纳或进行修改：
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="title">任务标题</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => setEditedTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="输入任务标题"
              />
            </div>

            <div>
              <Label htmlFor="description">任务描述</Label>
              <Textarea
                id="description"
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="输入任务描述（可选）"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="priority">优先级</Label>
              <Select
                value={String(editedTask.priority)}
                onValueChange={(value) => setEditedTask(prev => prev ? { ...prev, priority: Number(value) } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">低</SelectItem>
                  <SelectItem value="1">中</SelectItem>
                  <SelectItem value="2">高</SelectItem>
                  <SelectItem value="3">紧急</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">类别</Label>
              <Select
                value={editedTask.category}
                onValueChange={(value) => setEditedTask(prev => prev ? { ...prev, category: value as TaskCategory } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskCategory.WORK}>{categoryDisplayNames[TaskCategory.WORK]}</SelectItem>
                  <SelectItem value={TaskCategory.PERSONAL}>{categoryDisplayNames[TaskCategory.PERSONAL]}</SelectItem>
                  <SelectItem value={TaskCategory.HEALTH}>{categoryDisplayNames[TaskCategory.HEALTH]}</SelectItem>
                  <SelectItem value={TaskCategory.LEARNING}>{categoryDisplayNames[TaskCategory.LEARNING]}</SelectItem>
                  <SelectItem value={TaskCategory.SHOPPING}>{categoryDisplayNames[TaskCategory.SHOPPING]}</SelectItem>
                  <SelectItem value={TaskCategory.OTHER}>{categoryDisplayNames[TaskCategory.OTHER]}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isToday"
                checked={editedTask.isToday}
                onCheckedChange={(checked) => setEditedTask(prev => prev ? { ...prev, isToday: checked as boolean } : null)}
              />
              <Label htmlFor="isToday">设为今日任务</Label>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1"
            >
              {loading ? '处理中...' : '采纳任务'}
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? '处理中...' : '放弃任务'}
            </Button>
          </div>
          
          <Button
            onClick={handleCancel}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskConfirmationDialog; 