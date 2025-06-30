export declare class TokenManager {
    private tokenCache;
    private lastFetchTime;
    private readonly CACHE_DURATION;
    /**
     * �������LocalStorage�Զ���ȡToken
     */
    getTokenFromBrowser(): Promise<string>;
    /**
     * ��Chrome DevTools Protocol��ȡToken
     */
    private getTokenFromChromeDevTools;
    /**
     * ���ļ���ȡToken
     */
    private getTokenFromFile;
    /**
     * ��ȡToken�������棩
     */
    getToken(): Promise<string>;
    /**
     * ��֤Token�Ƿ���Ч
     */
    validateToken(token: string): Promise<boolean>;
    /**
     * ����Token���ļ�
     */
    saveTokenToFile(token: string): void;
    /**
     * ���Token����
     */
    clearCache(): void;
}
//# sourceMappingURL=tokenManager.d.ts.map