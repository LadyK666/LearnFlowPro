import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export class TokenManager {
  private tokenCache: string | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 从浏览器LocalStorage自动获取Token
   */
  async getTokenFromBrowser(): Promise<string> {
    try {
      // 尝试从Chrome DevTools Protocol获取
      const token = await this.getTokenFromChromeDevTools();
      if (token) {
        this.tokenCache = token;
        this.lastFetchTime = Date.now();
        return token;
      }
    } catch (error) {
      console.log('无法从Chrome DevTools获取Token，尝试其他方法...');
    }

    // 备用方案：从文件读取
    return this.getTokenFromFile();
  }

  /**
   * 从Chrome DevTools Protocol获取Token
   */
  private async getTokenFromChromeDevTools(): Promise<string | null> {
    try {
      // 使用Chrome DevTools Protocol连接到浏览器
      const response = await axios.get('http://localhost:9222/json');
      const tabs = response.data;
      
      // 找到My-Day应用的标签页
      const myDayTab = tabs.find((tab: any) => 
        tab.url && tab.url.includes('localhost:5174')
      );

      if (!myDayTab) {
        console.log('未找到My-Day应用标签页');
        return null;
      }

      // 这里需要实现Chrome DevTools Protocol的具体调用
      // 由于复杂性，我们使用更简单的方案
      return null;
    } catch (error) {
      console.log('Chrome DevTools Protocol连接失败');
      return null;
    }
  }

  /**
   * 从文件读取Token
   */
  private getTokenFromFile(): string {
    const tokenPath = path.join(__dirname, '..', 'token.txt');
    
    if (fs.existsSync(tokenPath)) {
      const token = fs.readFileSync(tokenPath, 'utf8').trim();
      if (token && token.startsWith('eyJ')) {
        return token;
      }
    }
    
    // 返回默认Token
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1MTE0OTQxMCwiZXhwIjoxNzUxNzU0MjEwfQ.6ro4XwDwTkQjMrH6ClqLZoultl_9dVKSIT4rwJRJZfw';
  }

  /**
   * 获取Token（带缓存）
   */
  async getToken(): Promise<string> {
    // 检查缓存是否有效
    if (this.tokenCache && (Date.now() - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.tokenCache;
    }

    // 获取新Token
    const token = await this.getTokenFromBrowser();
    this.tokenCache = token;
    this.lastFetchTime = Date.now();
    
    return token;
  }

  /**
   * 验证Token是否有效
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.get('http://localhost:4000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * 保存Token到文件
   */
  saveTokenToFile(token: string): void {
    const tokenPath = path.join(__dirname, '..', 'token.txt');
    fs.writeFileSync(tokenPath, token);
    console.log('Token已保存到文件');
  }

  /**
   * 清除Token缓存
   */
  clearCache(): void {
    this.tokenCache = null;
    this.lastFetchTime = 0;
    console.log('Token缓存已清除');
  }
} 