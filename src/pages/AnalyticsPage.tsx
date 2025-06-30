import React, { useState } from 'react';
import { useTasks } from '@/contexts/TasksContext';
import { TaskCategory, Priority } from '@/types';
import { getCategoryLabel, getPriorityLabel } from '@/lib/taskUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type FilterType = 'all' | 'today';

const AnalyticsPage: React.FC = () => {
  const { tasks, loading } = useTasks();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    if (filter === 'today') {
      return tasks.filter(task => task.isToday);
    }
    // For 'all', we show tasks that are either in today's plan or are in the pool (not today and not completed)
    return tasks.filter(task => task.isToday || !task.completed);
  }, [tasks, filter]);

  const categoryData = React.useMemo(() => {
    if (!filteredTasks) return [];
    
    const categoryCounts = filteredTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<TaskCategory, number>);

    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: getCategoryLabel(category as TaskCategory),
      value: count,
      category: category as TaskCategory,
    })).sort((a, b) => b.value - a.value);
  }, [filteredTasks]);
  
  const categoryTotal = React.useMemo(() => categoryData.reduce((acc, curr) => acc + curr.value, 0), [categoryData]);

  const priorityData = React.useMemo(() => {
    if (!filteredTasks) return [];

    const priorityCounts = filteredTasks.reduce((acc, task) => {
      const priority = task.priority;
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);

    return Object.entries(priorityCounts).map(([priority, count]) => ({
      name: getPriorityLabel(Number(priority) as Priority),
      value: count,
      priority: Number(priority) as Priority,
    }));
  }, [filteredTasks]);
  
  const priorityTotal = React.useMemo(() => priorityData.reduce((acc, curr) => acc + curr.value, 0), [priorityData]);
  
  const recentActivityData = React.useMemo(() => {
    if (!filteredTasks) return [];
    
    const completedTasks = filteredTasks.filter(task => task.completed && task.completedAt);
    
    const activityByDay: { [key: string]: number } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
      activityByDay[dateString] = 0;
    }

    completedTasks.forEach(task => {
      if (!task.completedAt) return;
      const completedDate = new Date(task.completedAt);
      if (isNaN(completedDate.getTime())) return;

      completedDate.setHours(0, 0, 0, 0);
      
      const diffDays = (today.getTime() - completedDate.getTime()) / (1000 * 3600 * 24);

      if (diffDays >= 0 && diffDays < 7) {
        const dateString = completedDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
        if (activityByDay[dateString] !== undefined) {
          activityByDay[dateString]++;
        }
      }
    });

    return Object.entries(activityByDay).map(([date, count]) => ({
      date,
      count,
    }));
  }, [filteredTasks]);

  const categoryChartConfig: ChartConfig = {
    value: {
      label: '任务数',
    },
    [TaskCategory.WORK]: {
      label: getCategoryLabel(TaskCategory.WORK),
      color: 'hsl(var(--chart-1))',
    },
    [TaskCategory.PERSONAL]: {
      label: getCategoryLabel(TaskCategory.PERSONAL),
      color: 'hsl(var(--chart-2))',
    },
    [TaskCategory.HEALTH]: {
      label: getCategoryLabel(TaskCategory.HEALTH),
      color: 'hsl(var(--chart-3))',
    },
    [TaskCategory.LEARNING]: {
      label: getCategoryLabel(TaskCategory.LEARNING),
      color: 'hsl(var(--chart-4))',
    },
    [TaskCategory.SHOPPING]: {
      label: getCategoryLabel(TaskCategory.SHOPPING),
      color: 'hsl(var(--chart-5))',
    },
    [TaskCategory.OTHER]: {
      label: getCategoryLabel(TaskCategory.OTHER),
      color: 'hsl(var(--chart-6))',
    },
  };

  const priorityChartConfig: ChartConfig = {
    value: {
      label: '任务数',
    },
    [Priority.URGENT]: {
      label: getPriorityLabel(Priority.URGENT),
      color: "hsl(var(--p-urgent))",
    },
    [Priority.HIGH]: {
      label: getPriorityLabel(Priority.HIGH),
      color: "hsl(var(--p-high))",
    },
    [Priority.MEDIUM]: {
      label: getPriorityLabel(Priority.MEDIUM),
      color: "hsl(var(--p-medium))",
    },
    [Priority.LOW]: {
      label: getPriorityLabel(Priority.LOW),
      color: "hsl(var(--p-low))",
    },
  };

  const activityChartConfig: ChartConfig = {
    count: {
      label: "完成数",
      color: "hsl(var(--chart-1))",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">统计分析</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          在这里，可视化您的任务数据，洞察您的效率模式。
        </p>
      </div>

      <div className="flex justify-center">
        <ToggleGroup type="single" value={filter} onValueChange={(value: FilterType) => value && setFilter(value)}>
          <ToggleGroupItem value="all" aria-label="显示全部任务">
            全部任务
          </ToggleGroupItem>
          <ToggleGroupItem value="today" aria-label="仅显示今日计划">
            今日计划
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>任务分类分布</CardTitle>
            <CardDescription>各类任务的数量占比</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="relative mx-auto aspect-square max-h-[300px]">
                <ChartContainer config={categoryChartConfig}>
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={75}
                        strokeWidth={2}
                        stroke="hsl(var(--card))"
                        paddingAngle={2}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${entry.name}`} 
                            fill={categoryChartConfig[entry.category]?.color}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none relative bottom-2">
                    <span className="text-xs text-muted-foreground">总任务</span>
                    <span className="text-xl font-bold">{categoryTotal}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-sm text-gray-500 dark:text-gray-400">没有数据可供显示</p>
              </div>
            )}
            {categoryData.length > 0 && (
                <div className="flex flex-col gap-2 text-sm mt-4">
                    <div className="font-medium text-gray-500 dark:text-gray-400">图例</div>
                    {categoryData.map((entry) => (
                        <div key={entry.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: categoryChartConfig[entry.category]?.color }}
                                />
                                <span>{entry.name}</span>
                            </div>
                            <span className="font-medium">{entry.value}</span>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>任务优先级分布</CardTitle>
            <CardDescription>各优先级任务的数量占比</CardDescription>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <div className="relative mx-auto aspect-square max-h-[300px]">
                <ChartContainer config={priorityChartConfig}>
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={priorityData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={75}
                        strokeWidth={2}
                        stroke="hsl(var(--card))"
                        paddingAngle={2}
                      >
                        {priorityData.map((entry, index) => (
                          <Cell 
                            key={`cell-${entry.name}`} 
                            fill={priorityChartConfig[entry.priority]?.color} 
                          />
                        ))}
                      </Pie>
                    </PieChart>
                </ChartContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none relative bottom-2">
                    <span className="text-xs text-muted-foreground">总任务</span>
                    <span className="text-xl font-bold">{priorityTotal}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-sm text-gray-500 dark:text-gray-400">没有数据可供显示</p>
              </div>
            )}
            {priorityData.length > 0 && (
                 <div className="flex flex-col gap-2 text-sm mt-4">
                    <div className="font-medium text-gray-500 dark:text-gray-400">图例</div>
                    {priorityData.map((entry) => (
                        <div key={entry.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: priorityChartConfig[entry.priority]?.color }}
                                />
                                <span>{entry.name}</span>
                            </div>
                            <span className="font-medium">{entry.value}</span>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>近期活动趋势</CardTitle>
            <CardDescription>过去7天内完成的任务数量</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivityData.some(d => d.count > 0) ? (
              <ChartContainer config={activityChartConfig} className="max-h-[250px] w-full">
                <BarChart data={recentActivityData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-sm text-gray-500 dark:text-gray-400">最近7天没有完成的任务。</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage; 