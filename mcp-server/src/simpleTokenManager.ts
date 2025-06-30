import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export class SimpleTokenManager {
  private tokenCache: string | null = null;
  private tokenPath: string;

  constructor() {
    // 在ES模块中获取__dirname的等效方法
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.tokenPath = path.join(__dirname, '..', 'token.txt');
  }

  /**
   * 获取Token（从文件读取）
   */
  getToken(): string {
    try {
      if (fs.existsSync(this.tokenPath)) {
        const token = fs.readFileSync(this.tokenPath, 'utf8').trim();
        if (token && token.startsWith('eyJ')) {
          this.tokenCache = token;
          return token;
        }
      }
    } catch (error) {
      console.log('读取Token文件失败:', error);
    }

    // 返回默认Token
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1MTE0OTQxMCwiZXhwIjoxNzUxNzU0MjEwfQ.6ro4XwDwTkQjMrH6ClqLZoultl_9dVKSIT4rwJRJZfw';
  }

  /**
   * 保存Token到文件
   */
  saveToken(token: string): void {
    try {
      fs.writeFileSync(this.tokenPath, token);
      this.tokenCache = token;
      console.log('Token已保存到文件');
    } catch (error) {
      console.log('保存Token失败:', error);
    }
  }

  /**
   * 监听Token文件变化
   */
  watchTokenFile(callback: (token: string) => void): void {
    if (fs.existsSync(this.tokenPath)) {
      fs.watch(this.tokenPath, (eventType, filename) => {
        if (eventType === 'change') {
          const newToken = this.getToken();
          if (newToken !== this.tokenCache) {
            this.tokenCache = newToken;
            callback(newToken);
          }
        }
      });
      console.log('开始监听Token文件变化');
    }
  }
} 