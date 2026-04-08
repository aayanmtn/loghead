import { DatabaseAdapter } from "./adapter.js";
export declare class AuthService {
    private db;
    private secretKey;
    private tenantId?;
    constructor(db: DatabaseAdapter);
    setTenantId(id: string): void;
    initialize(): Promise<void>;
    getOrCreateMcpToken(): Promise<string>;
    createStreamToken(streamId: string): Promise<string>;
    verifyToken(token: string): Promise<{
        streamId: string;
        role?: string;
    } | null>;
    static decodeTokenUnsafe(token: string): any;
}
