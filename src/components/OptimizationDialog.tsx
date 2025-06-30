import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Check, X, Lightbulb, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface OptimizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string | null;
  optimizationData?: {
    optimizationSummary: string;
    taskUpdates: Array<{
      id: number;
      title: string;
      description: string;
      priority: number;
      category: string;
      isToday: boolean;
      reason: string;
    }>;
  } | null;
  onApplyOptimization?: (taskUpdates: Array<{
    id: number;
    title?: string;
    description?: string;
    priority?: number;
    category?: string;
    isToday?: boolean;
    reason?: string;
  }>) => Promise<boolean>;
}

const OptimizationDialog: React.FC<OptimizationDialogProps> = ({
  isOpen,
  onClose,
  suggestions,
  optimizationData,
  onApplyOptimization
}) => {
  const [applying, setApplying] = useState(false);

  if (!isOpen || !suggestions) return null;

  // 调试信息
  console.log('OptimizationDialog props:', {
    isOpen,
    suggestions: suggestions?.substring(0, 100) + '...',
    optimizationData,
    hasTaskUpdates: optimizationData?.taskUpdates?.length > 0,
    onApplyOptimization: !!onApplyOptimization
  });

  // 检查是否有有效的任务更新数据
  const hasValidTaskUpdates = optimizationData?.taskUpdates?.some(update => 
    update.id && update.title && update.description !== undefined
  );

  console.log('hasValidTaskUpdates:', hasValidTaskUpdates);

  const handleApplyOptimization = async () => {
    if (!optimizationData?.taskUpdates || !onApplyOptimization) {
      toast.error('没有可应用的优化数据');
      return;
    }

    // 过滤出有效的任务更新数据
    const validTaskUpdates = optimizationData.taskUpdates.filter(update => 
      update.id && update.title && update.description !== undefined
    );

    if (validTaskUpdates.length === 0) {
      toast.error('没有有效的任务更新数据');
      return;
    }

    setApplying(true);
    try {
      const taskUpdates = validTaskUpdates.map(update => ({
        id: update.id,
        title: update.title,
        description: update.description,
        priority: update.priority,
        category: update.category,
        isToday: update.isToday,
        reason: update.reason
      }));

      const success = await onApplyOptimization(taskUpdates);
      if (success) {
        toast.success(`成功应用了 ${validTaskUpdates.length} 个任务的优化！`);
        onClose();
      } else {
        toast.error('应用优化失败');
      }
    } catch (error) {
      console.error('应用优化失败:', error);
      toast.error('应用优化失败');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-xl">日程优化建议</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="prose prose-sm max-w-none space-y-4">
              {/* 优化总结 */}
              {optimizationData?.optimizationSummary && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    📋 优化总结
                  </h3>
                  <div className="text-green-800">
                    {optimizationData.optimizationSummary}
                  </div>
                </div>
              )}

              {/* AI优化建议 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  💡 AI优化建议
                </h3>
                <div className="text-blue-800 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {suggestions}
                </div>
              </div>

              {/* 具体修改建议 */}
              {optimizationData?.taskUpdates && optimizationData.taskUpdates.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    🔧 具体修改建议 ({optimizationData.taskUpdates.length} 个任务)
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {optimizationData.taskUpdates.map((update, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <span className="font-medium">任务 {update.id}</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>标题:</strong> {update.title}</div>
                          <div><strong>描述:</strong> <span className="break-words">{update.description}</span></div>
                          <div><strong>优先级:</strong> {update.priority}</div>
                          <div><strong>类别:</strong> {update.category}</div>
                          <div><strong>今日任务:</strong> {update.isToday ? '是' : '否'}</div>
                          <div><strong>修改原因:</strong> <span className="break-words">{update.reason}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={applying}
            >
              <X className="h-4 w-4 mr-2" />
              关闭
            </Button>
            {onApplyOptimization && (
              <Button
                onClick={handleApplyOptimization}
                disabled={applying || !hasValidTaskUpdates}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {applying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    应用中...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    应用优化 {hasValidTaskUpdates ? `(${optimizationData?.taskUpdates?.length || 0} 个任务)` : '(无有效数据)'}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizationDialog; 