import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export class TokenManager {
  private tokenCache: string | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5���ӻ���

  /**
   * �������LocalStorage�Զ���ȡToken
   */
  async getTokenFromBrowser(): Promise<string> {
    try {
      // ���Դ�Chrome DevTools Protocol��ȡ
      const token = await this.getTokenFromChromeDevTools();
      if (token) {
        this.tokenCache = token;
        this.lastFetchTime = Date.now();
        return token;
      }
    } catch (error) {
      console.log('�޷���Chrome DevTools��ȡToken��������������...');
    }

    // ���÷��������ļ���ȡ
    return this.getTokenFromFile();
  }

  /**
   * ��Chrome DevTools Protocol��ȡToken
   */
  private async getTokenFromChromeDevTools(): Promise<string | null> {
    try {
      // ʹ��Chrome DevTools Protocol���ӵ������
      const response = await axios.get('http://localhost:9222/json');
      const tabs = response.data;
      
      // �ҵ�My-DayӦ�õı�ǩҳ
      const myDayTab = tabs.find((tab: any) => 
        tab.url && tab.url.includes('localhost:5174')
      );

      if (!myDayTab) {
        console.log('δ�ҵ�My-DayӦ�ñ�ǩҳ');
        return null;
      }

      // ������Ҫʵ��Chrome DevTools Protocol�ľ������
      // ���ڸ����ԣ�����ʹ�ø��򵥵ķ���
      return null;
    } catch (error) {
      console.log('Chrome DevTools Protocol����ʧ��');
      return null;
    }
  }

  /**
   * ���ļ���ȡToken
   */
  private getTokenFromFile(): string {
    const tokenPath = path.join(__dirname, '..', 'token.txt');
    
    if (fs.existsSync(tokenPath)) {
      const token = fs.readFileSync(tokenPath, 'utf8').trim();
      if (token && token.startsWith('eyJ')) {
        return token;
      }
    }
    
    // ����Ĭ��Token
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1MTE0OTQxMCwiZXhwIjoxNzUxNzU0MjEwfQ.6ro4XwDwTkQjMrH6ClqLZoultl_9dVKSIT4rwJRJZfw';
  }

  /**
   * ��ȡToken�������棩
   */
  async getToken(): Promise<string> {
    // ��黺���Ƿ���Ч
    if (this.tokenCache && (Date.now() - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.tokenCache;
    }

    // ��ȡ��Token
    const token = await this.getTokenFromBrowser();
    this.tokenCache = token;
    this.lastFetchTime = Date.now();
    
    return token;
  }

  /**
   * ��֤Token�Ƿ���Ч
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
   * ����Token���ļ�
   */
  saveTokenToFile(token: string): void {
    const tokenPath = path.join(__dirname, '..', 'token.txt');
    fs.writeFileSync(tokenPath, token);
    console.log('Token�ѱ��浽�ļ�');
  }

  /**
   * ���Token����
   */
  clearCache(): void {
    this.tokenCache = null;
    this.lastFetchTime = 0;
    console.log('Token���������');
  }
} 