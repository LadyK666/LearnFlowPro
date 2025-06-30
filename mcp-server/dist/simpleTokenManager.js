import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
export class SimpleTokenManager {
    tokenCache = null;
    tokenPath;
    constructor() {
        // ��ESģ���л�ȡ__dirname�ĵ�Ч����
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.tokenPath = path.join(__dirname, '..', 'token.txt');
    }
    /**
     * ��ȡToken�����ļ���ȡ��
     */
    getToken() {
        try {
            if (fs.existsSync(this.tokenPath)) {
                const token = fs.readFileSync(this.tokenPath, 'utf8').trim();
                if (token && token.startsWith('eyJ')) {
                    this.tokenCache = token;
                    return token;
                }
            }
        }
        catch (error) {
            console.log('��ȡToken�ļ�ʧ��:', error);
        }
        // ����Ĭ��Token
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1MTE0OTQxMCwiZXhwIjoxNzUxNzU0MjEwfQ.6ro4XwDwTkQjMrH6ClqLZoultl_9dVKSIT4rwJRJZfw';
    }
    /**
     * ����Token���ļ�
     */
    saveToken(token) {
        try {
            fs.writeFileSync(this.tokenPath, token);
            this.tokenCache = token;
            console.log('Token�ѱ��浽�ļ�');
        }
        catch (error) {
            console.log('����Tokenʧ��:', error);
        }
    }
    /**
     * ����Token�ļ��仯
     */
    watchTokenFile(callback) {
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
            console.log('��ʼ����Token�ļ��仯');
        }
    }
}
//# sourceMappingURL=simpleTokenManager.js.map