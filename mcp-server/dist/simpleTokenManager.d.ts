export declare class SimpleTokenManager {
    private tokenCache;
    private tokenPath;
    constructor();
    /**
     * ��ȡToken�����ļ���ȡ��
     */
    getToken(): string;
    /**
     * ����Token���ļ�
     */
    saveToken(token: string): void;
    /**
     * ����Token�ļ��仯
     */
    watchTokenFile(callback: (token: string) => void): void;
}
//# sourceMappingURL=simpleTokenManager.d.ts.map