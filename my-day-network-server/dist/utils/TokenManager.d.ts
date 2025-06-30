export declare class TokenManager {
    private tokenCache;
    private tokenPath;
    constructor();
    /**
     * 获取Token，从文件读取
     */
    getToken(): string;
    /**
     * 保存Token到文件
     */
    saveToken(token: string): void;
    /**
     * 监听Token文件变化
     */
    watchTokenFile(callback: (token: string) => void): void;
    /**
     * 检查Token是否有效
     */
    isTokenValid(token: string): boolean;
    /**
     * 获取Token文件路径
     */
    getTokenPath(): string;
}
//# sourceMappingURL=TokenManager.d.ts.map