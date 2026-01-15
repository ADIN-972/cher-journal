export declare const config: {
    env: string;
    isDev: boolean;
    port: number;
    host: string;
    frontendUrl: string;
    adminUrl: string;
    backendUrl: string;
    databaseUrl: string;
    sessionSecret: string;
    sessionMaxAge: number;
    masterEncryptionKey: string;
    encryptionEnabled: boolean;
    stripe: {
        secretKey: string;
        webhookSecret: string;
        publishableKey: string;
    };
    corsOrigins: string[];
    uploadDir: string;
    maxUploadSize: number;
    waitDuration: number;
    seed: {
        adminEmail: string;
        adminPassword: string;
        userEmail: string;
        userPassword: string;
    };
    rateLimit: {
        max: number;
        timeWindow: string;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map