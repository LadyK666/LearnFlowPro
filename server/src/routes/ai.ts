import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const prisma = new PrismaClient();
const execAsync = promisify(exec);

// 获取用户的所有AI对话记录
router.get('/chats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const aiChats = await prisma.aiChat.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(aiChats);
  } catch (error) {
    console.error('获取AI对话记录失败:', error);
    res.status(500).json({ error: '获取AI对话记录失败' });
  }
});

// 获取单个AI对话记录
router.get('/chats/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const aiChat = await prisma.aiChat.findFirst({
      where: { id: parseInt(id), authorId: userId }
    });

    if (!aiChat) {
      res.status(404).json({ error: '对话记录不存在' });
      return;
    }

    res.json(aiChat);
  } catch (error) {
    console.error('获取AI对话记录失败:', error);
    res.status(500).json({ error: '获取AI对话记录失败' });
  }
});

const toolParamRegexMap: Record<string, RegExp> = {
    createTask: /title：(.*?)，description：(.*?)，priority：(\d+)，category：(.*?)，isToday：(true|false)/,
    // 可以继续扩展其他工具的正则
  };

// 发送消息到AI并保存对话记录
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { prompt, model = 'Qwen/Qwen2.5-VL-72B-Instruct', tool = 'general' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 调用AI API获取回复,得到tool
    const aiResponse_tool = await callAIAPI_Tool(prompt, model, tool);
    const responseText_tool = aiResponse_tool.message;
    
    // 2. 用正则先提取 tool
    const toolMatch = responseText_tool.match(/Tool：\\box\{(.+?)\}/);
    let realTool = toolMatch ? toolMatch[1] : 'general'; // 默认general
    

    let finalResponse = '';
    let extractedParams: Record<string, any> | null = null;
    let createdTask = null;

    if (realTool === 'createTask') {
      const aiResponse = await callAIAPI(prompt, model, 'createTask');
      const responseText = aiResponse.message;  
      const paramMatch = responseText.match(toolParamRegexMap.createTask);
      if (paramMatch) {
        extractedParams = {
          title: paramMatch[1],
          description: paramMatch[2],
          priority: parseInt(paramMatch[3]),
          category: paramMatch[4],
          isToday: paramMatch[5] === 'true'
        };
        finalResponse = responseText;
        // 自动创建任务
        if (extractedParams) {
          const taskResult = await createTaskFromAI(userId, extractedParams);
          if (taskResult.success) {
            createdTask = taskResult.task;
          }
        }
      }
    } else if (realTool === 'analyzeTasks') {
      // 分析任务的参数提取
      const analyzeMatch = responseText_tool.match(/分析类型：(.*?)，时间范围：(.*?)，重点：(.*?)/);
      if (analyzeMatch) {
        extractedParams = {
          analysisType: analyzeMatch[1],
          timeRange: analyzeMatch[2],
          focus: analyzeMatch[3]
        };
        finalResponse = responseText_tool;
      }
    } else if (realTool === 'scheduleOptimization') {
      // 日程优化：获取用户所有任务数据，然后进行优化
      const userTasksResult = await getAllUserTasks(userId);
      
      if (!userTasksResult.success) {
        throw new Error('获取任务数据失败');
      }

      // 构建任务数据字符串
      const tasksData = userTasksResult.tasks!.map(task => 
        `任务ID: ${task.id}, 标题: ${task.title}, 描述: ${task.description || '无'}, 优先级: ${task.priority}, 类别: ${task.category}, 已完成: ${task.completed}, 今日任务: ${task.isToday}`
      ).join('\n');

      // 第二阶段AI调用：基于任务数据进行优化
      const optimizationPrompt = `基于以下用户任务数据，提供系统要求的修改建议：

用户任务数据：
${tasksData}
用户要求：
${prompt}
`;

      const optimizationResponse = await callAIAPI(optimizationPrompt, model, 'optimizeSchedule');
      finalResponse = optimizationResponse.message;
      
      // 解析AI响应中的JSON数据
      try {
        console.log('开始解析AI响应:', finalResponse.substring(0, 200) + '...');
        
        // 尝试多种方式匹配JSON
        let jsonMatch = finalResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          // 如果没找到，尝试查找包含taskUpdates的部分
          jsonMatch = finalResponse.match(/\{[^}]*"taskUpdates"[^}]*\}/);
        }
        if (!jsonMatch) {
          // 尝试查找包含"taskUpdates"的更大范围
          const taskUpdatesIndex = finalResponse.indexOf('"taskUpdates"');
          if (taskUpdatesIndex !== -1) {
            // 从taskUpdates开始向前找到最近的{
            let startIndex = taskUpdatesIndex;
            while (startIndex > 0 && finalResponse[startIndex] !== '{') {
              startIndex--;
            }
            // 从{开始向后找到匹配的}
            let braceCount = 0;
            let endIndex = startIndex;
            for (let i = startIndex; i < finalResponse.length; i++) {
              if (finalResponse[i] === '{') braceCount++;
              if (finalResponse[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                  endIndex = i;
                  break;
                }
              }
            }
            if (endIndex > startIndex) {
              jsonMatch = [finalResponse.substring(startIndex, endIndex + 1)];
            }
          }
        }
        
        if (jsonMatch) {
          console.log('找到JSON匹配:', jsonMatch[0].substring(0, 200) + '...');
          
          let jsonString = jsonMatch[0];
          
          // 尝试修复常见的JSON问题
          // 1. 统一引号格式（将单引号替换为双引号）
          jsonString = jsonString.replace(/'/g, '"');
          
          // 2. 修复可能的JSON结构问题
          // 检查是否缺少闭合的括号
          const openBraces = (jsonString.match(/\{/g) || []).length;
          const closeBraces = (jsonString.match(/\}/g) || []).length;
          const openBrackets = (jsonString.match(/\[/g) || []).length;
          const closeBrackets = (jsonString.match(/\]/g) || []).length;
          
          console.log('括号检查:', { openBraces, closeBraces, openBrackets, closeBrackets });
          
          // 如果缺少闭合括号，尝试修复
          if (closeBraces < openBraces) {
            jsonString += '}'.repeat(openBraces - closeBraces);
          }
          if (closeBrackets < openBrackets) {
            jsonString += ']'.repeat(openBrackets - closeBrackets);
          }
          
          console.log('修复后的JSON:', jsonString.substring(0, 200) + '...');
          
          const optimizationData = JSON.parse(jsonString);
          console.log('解析后的数据:', optimizationData);
          
          if (optimizationData.taskUpdates && Array.isArray(optimizationData.taskUpdates)) {
            console.log('找到taskUpdates数组，长度:', optimizationData.taskUpdates.length);
            
            // 过滤和验证任务更新数据
            const validTaskUpdates = optimizationData.taskUpdates.filter((update: any) => {
              return update && 
                     typeof update.id === 'number' && 
                     typeof update.title === 'string' && 
                     typeof update.description === 'string' &&
                     typeof update.priority === 'number' &&
                     typeof update.category === 'string' &&
                     typeof update.isToday === 'boolean';
            });
            
            console.log('有效任务更新数量:', validTaskUpdates.length);
            
            if (validTaskUpdates.length > 0) {
              // 准备批量更新数据
              const taskUpdates = validTaskUpdates.map((update: any) => ({
                id: update.id,
                title: update.title,
                description: update.description,
                priority: update.priority,
                category: update.category,
                isToday: update.isToday
              }));
              
              console.log('处理后的taskUpdates:', taskUpdates);
              
              // 将更新数据添加到返回结果中
              extractedParams = {
                optimizationSummary: optimizationData.optimizationSummary || '优化建议',
                taskUpdates: taskUpdates
              };
              
              console.log('最终extractedParams:', extractedParams);
            } else {
              console.log('没有有效的任务更新数据');
            }
          } else {
            console.log('taskUpdates不存在或不是数组:', optimizationData.taskUpdates);
          }
        } else {
          console.log('未找到JSON格式的数据');
        }
      } catch (error) {
        console.error('解析优化数据失败:', error);
        console.error('原始响应:', finalResponse);
        // 如果解析失败，仍然返回AI的原始回复
      }
    } else if (realTool === 'goalSetting') {
      // 目标设定的参数提取
      const goalMatch = responseText_tool.match(/目标类型：(.*?)，时间框架：(.*?)，具体目标：(.*?)/);
      if (goalMatch) {
        extractedParams = {
          goalType: goalMatch[1],
          timeFrame: goalMatch[2],
          specificGoal: goalMatch[3]
        };
        finalResponse = responseText_tool;
      }
    }
    // 可以继续添加更多tool的解析逻辑

    // 4. 保存对话记录，包括最终的tool和提取参数
    const aiChat = await prisma.aiChat.create({
      data: {
        prompt,
        response: finalResponse,
        model,
        tool: realTool,
        authorId: userId,
      }
    });

    // 6. 返回对话及提取信息，让前端能够处理
    res.json({
      chat: aiChat,
      tool: realTool,
      params: extractedParams,
      createdTask: createdTask
    });

  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ error: '发送消息失败' });
  }
});

// 删除AI对话记录
router.delete('/chats/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const aiChat = await prisma.aiChat.findFirst({
      where: { id: parseInt(id), authorId: userId }
    });

    if (!aiChat) {
      return res.status(404).json({ error: '对话记录不存在' });
    }

    await prisma.aiChat.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: '对话记录已删除' });
  } catch (error) {
    console.error('删除对话记录失败:', error);
    res.status(500).json({ error: '删除对话记录失败' });
  }
});

// 删除用户的所有AI对话记录
router.delete('/chats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    await prisma.aiChat.deleteMany({
      where: { authorId: userId }
    });

    res.json({ message: '所有对话记录已删除' });
  } catch (error) {
    console.error('删除所有对话记录失败:', error);
    res.status(500).json({ error: '删除所有对话记录失败' });
  }
});

// 删除AI创建的任务
router.delete('/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id: parseInt(id), authorId: userId }
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: '任务已删除' });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({ error: '删除任务失败' });
  }
});

// 更新AI创建的任务
router.put('/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { title, description, priority, category, isToday } = req.body;

    const task = await prisma.task.findFirst({
      where: { id: parseInt(id), authorId: userId }
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description: description || '',
        priority: Number(priority),
        category,
        isToday: isToday || false,
        updatedAt: new Date(),
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json({ error: '更新任务失败' });
  }
});

// 读取用户所有任务的函数
async function getAllUserTasks(userId: number) {
  try {
    const tasks = await prisma.task.findMany({
      where: { authorId: userId },
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    // 转换为AI友好的数据结构
    const taskData = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      completed: task.completed,
      isToday: task.isToday,
      createdAt: task.createdAt
    }));

    return { success: true, tasks: taskData };
  } catch (error) {
    console.error('获取用户任务失败:', error);
    return { success: false, error: '获取任务失败' };
  }
}

// 批量更新任务的函数
async function batchUpdateTasks(userId: number, taskUpdates: Array<{
  id: number;
  title?: string;
  description?: string;
  priority?: number;
  category?: string;
  isToday?: boolean;
}>) {
  try {
    const updatePromises = taskUpdates.map(async (update) => {
      // 验证任务属于当前用户
      const task = await prisma.task.findFirst({
        where: { id: update.id, authorId: userId }
      });

      if (!task) {
        throw new Error(`任务 ${update.id} 不存在或不属于当前用户`);
      }

      return prisma.task.update({
        where: { id: update.id },
        data: {
          ...(update.title && { title: update.title }),
          ...(update.description !== undefined && { description: update.description }),
          ...(update.priority !== undefined && { priority: update.priority }),
          ...(update.category && { category: update.category }),
          ...(update.isToday !== undefined && { isToday: update.isToday }),
          updatedAt: new Date(),
        },
      });
    });

    const updatedTasks = await Promise.all(updatePromises);
    return { success: true, tasks: updatedTasks };
  } catch (error) {
    console.error('批量更新任务失败:', error);
    return { success: false, error: '批量更新任务失败' };
  }
}

async function callAIAPI_Tool(prompt: string, model: string, tool: string): Promise<{ message: string }> {
  try {
    const token = process.env.SILICONFLOW_API_KEY || 'your api key';
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model === 'gpt-3.5-turbo' ? 'Qwen/Qwen2.5-VL-72B-Instruct' : model,
        messages: [
          {
            role: 'system',
            content: `你是一个智能任务管理系统的子助手，根据用户的需求，你需要判断用户需要的功能（tool）是什么：目前项目实现了以下几个tool：
            - createTask：可以根据用户的要求创建项目
            - scheduleOptimization：根据用户的需求来批量优化任务的优先级，description等
            
            你的回答应该严格按照以下格式：
            Tool：\\box{本次用户需要的tool名称}
            
            示例：
            User：我想给我的数学第五章作业制定一个任务
            Ai：用户需要创建一个任务，所以根据tool列表，需要调用createTask

            Tool：\\box{createTask}
            `
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        max_tokens: 512,
        enable_thinking: true,
        thinking_budget: 4096,
        min_p: 0.05,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        stop: []
      })
    };

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', options);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return {
        message: data.choices[0].message.content
      };
    } else {
      throw new Error('API返回的数据格式不正确');
    }
  } catch (error) {
    console.error('AI API调用失败:', error);
    
    // 如果API调用失败，返回模拟回复
    const fallbackResponses = [
      "抱歉，AI服务暂时不可用。让我为您提供一个基本的建议...",
      "由于网络问题，我暂时无法连接到AI服务。不过我可以为您提供一些一般性的指导...",
      "AI服务出现了一些问题。让我为您提供一些替代方案..."
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return {
      message: `${randomResponse}\n\n模型: ${model}\n工具: ${tool}\n\n如果您需要更具体的帮助，请稍后再试。`
    };
  }
}

// 调用硅流AI API
async function callAIAPI(prompt: string, model: string, tool: string): Promise<{ message: string }> {
  try {
    const token = process.env.SILICONFLOW_API_KEY || '';
    console.log("当前 tool 是：", tool);

    let prompt_tool = `你是一个智能任务管理助手，请根据用户的需求提供帮助。`;
    
    if(tool === 'createTask'){
        prompt_tool = `你是一个负责任务创建的智能任务管理子助手，根据用户的需求，返回确定的参数。请严格按照以下格式回复内容，方便程序使用正则提取对应字段：
        answer：\\box{展示给用户的友好回答}
        Tool：\\box{createTask}
        title：<任务标题>，description：<任务描述>，priority：<任务优先级数字0-3>，category：<任务类别（工作，个人，健康，学习，购物，其他）>，isToday：<true或false>
        
        示例：
        User：我想给我的数学第五章作业制定一个任务
        answer：\\box{好的！我将调用createTask工具为您制作一个任务来计划完成数学第五章作业,祝您学习顺利。}

        Tool：\\box{createTask}
        title：完成数学第五章作业，description：数学第5章习题练习，priority：2，category：学习，isToday：true`;
    } else if(tool === 'optimizeSchedule') {
        prompt_tool = `你是一个专业的日程优化助手，请根据用户的任务数据提供详细的优化建议。请用中文回答，格式要清晰易读。用户会提供：
用户任务数据：
用户要求：

请根据用户的想法选择性的提供部分或者全部任务的更改方案


你的回答必须严格按照以下JSON格式，以完成batchUpdateTasks的数据库操作：

{
  "optimizationSummary": "优化总结和建议",
  "taskUpdates": [
    {
      "id": 任务ID,和原先相同
      "title": "优化后的标题",纯文字
      "description": "优化后的描述",纯文字
      "priority": 新的优先级(0-3),
      "category": "任务类别" 学习、工作、个人、健康、购物、其他
      "isToday": true/false,
      "reason": "修改原因"
    }
  ]
}

重要要求：
1. 请确保JSON格式完全正确，所有字段都必须包含，只要有{}作为一个任务的修改方案，就必须是完整的，不要任何注释
2. 所有字符串必须使用双引号，不能使用单引号，也不能不加引号
3. 确保JSON结构完整，不要截断
4. 布尔值使用true或false，不要用引号包围
5. 数字不要用引号包围
6. category字段必须使用以下中文类别之一：学习、工作、个人、健康、购物、其他
7. reason字段必须详细说明为什么进行这个修改
8. 除非用户要求，否则所有内容都要保留原来的关键信息

示例：
用户任务数据：
[
  {
    "id": 1,
    "title": "写期末论文初稿",
    "description": "开始写关于人工智能伦理的论文，预计需要3天",
    "priority": 1,
    "category": "学习",
    "isToday": false
  },
  {
    "id": 2,
    "title": "买菜和收租",
    "description": "去超市买蔬菜水果，考虑健康饮食，记得找小王收房租",
    "priority": 2,
    "category": "生活",
    "isToday": true
  },
  {
    "id": 3,
    "title": "锻炼身体",
    "description": "跑步30分钟，增强体质",
    "priority": 1,
    "category": "健康",
    "isToday": false
  }
]

用户要求：
帮我整理任务，相对提高学习任务的优先级

Ai：好的，根据您的要求，只有论文初稿任务需要修改，任务整体修改内容如下：

{
  "optimizationSummary": "根据用户要求，提升了学习任务的优先级",
  "taskUpdates": [
    {
      "id": 1,
      "title": "论文初稿",
      "description": "【学习】撰写人工智能伦理论文初稿（预计需3天）",
      "priority": 3,
      "category": "学习",
      "isToday": true,
      "reason": "学习任务优先级提高，相比于买菜和跑步的优先级更高"
    }
  ]
}`;
    }

    console.log("使用的 prompt_tool：", prompt_tool);

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model === 'gpt-3.5-turbo' ? 'Qwen/Qwen2.5-VL-72B-Instruct' : model,
        messages: [
          {
            role: 'system',
            content: prompt_tool
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        max_tokens: 4096,
        enable_thinking: true,
        thinking_budget: 4096,
        min_p: 0.05,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        stop: []
      })
    };

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', options);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return {
        message: data.choices[0].message.content
      };
    } else {
      throw new Error('API返回的数据格式不正确');
    }
  } catch (error) {
    console.error('AI API调用失败:', error);
    
    // 如果API调用失败，返回模拟回复
    const fallbackResponses = [
      "抱歉，AI服务暂时不可用。让我为您提供一个基本的建议...",
      "由于网络问题，我暂时无法连接到AI服务。不过我可以为您提供一些一般性的指导...",
      "AI服务出现了一些问题。让我为您提供一些替代方案..."
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return {
      message: `${randomResponse}\n\n模型: ${model}\n工具: ${tool}\n\n如果您需要更具体的帮助，请稍后再试。`
    };
  }
}

// 创建任务的辅助函数
async function createTaskFromAI(userId: number, taskParams: any) {
  try {
    // 类别映射函数
    const mapCategory = (category: string): string => {
      const categoryMap: { [key: string]: string } = {
        '学习': 'learning',
        '工作': 'work',
        '个人': 'personal',
        '健康': 'health',
        '购物': 'shopping',
        '其他': 'other'
      };
      
      // 如果类别已经是英文，直接返回
      if (Object.values(categoryMap).includes(category)) {
        return category;
      }
      
      // 如果是中文，进行映射
      return categoryMap[category] || 'other';
    };

    const normalizedCategory = mapCategory(taskParams.category);

    const newTask = await prisma.task.create({
      data: {
        title: taskParams.title,
        description: taskParams.description || '',
        priority: Number(taskParams.priority),
        category: normalizedCategory,
        isToday: taskParams.isToday || false,
        authorId: userId,
        updatedAt: new Date(),
      },
    });
    return { success: true, task: newTask };
  } catch (error) {
    console.error('AI创建任务失败:', error);
    return { success: false, error: '无法创建任务' };
  }
}

// 批量更新任务（用于日程优化后的确认执行）
router.post('/tasks/batch-update', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { taskUpdates } = req.body;

    if (!taskUpdates || !Array.isArray(taskUpdates)) {
      return res.status(400).json({ error: '任务更新数据格式错误' });
    }

    const result = await batchUpdateTasks(userId, taskUpdates);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: '任务批量更新成功',
        updatedTasks: result.tasks 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('批量更新任务失败:', error);
    res.status(500).json({ error: '批量更新任务失败' });
  }
});

export default router; 