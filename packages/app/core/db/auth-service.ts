import jwt from "jsonwebtoken";
import { DatabaseAdapter } from "./adapter.js";
import { randomBytes } from "crypto";

export class AuthService {
    private db: DatabaseAdapter;
    private secretKey: string | null = null;
    private tenantId?: string;

    constructor(db: DatabaseAdapter) {
        this.db = db;
    }

    setTenantId(id: string) {
        this.tenantId = id;
    }

    async initialize() {
        if (this.secretKey) return;

        // Try to load secret from DB
        const row = await this.db.get<{ value: string }>("SELECT value FROM system_config WHERE key = 'jwt_secret'");

        let rawSecret = row?.value;

        if (!rawSecret) {
            // Generate new secret
            rawSecret = randomBytes(64).toString('hex');
            await this.db.run("INSERT INTO system_config (key, value) VALUES ('jwt_secret', ?)", [rawSecret]);
        }

        this.secretKey = rawSecret;
    }

    async getOrCreateMcpToken(): Promise<string> {
        await this.initialize();
        if (!this.secretKey) throw new Error("Auth not initialized");

        // Check if token exists in DB
        const row = await this.db.get<{ value: string }>("SELECT value FROM system_config WHERE key = 'mcp_token'");
        if (row?.value) {
            return row.value;
        }

        // Create new token
        // A system token that has access to everything (conceptually)
        const token = jwt.sign({ sub: "system:mcp", iss: "loghead", role: "admin" }, this.secretKey, { algorithm: "HS512" });

        await this.db.run("INSERT INTO system_config (key, value) VALUES ('mcp_token', ?)", [token]);

        return token;
    }

    async createStreamToken(streamId: string): Promise<string> {
        await this.initialize();
        if (!this.secretKey) throw new Error("Auth not initialized");

        const payload: any = { sub: streamId, iss: "loghead" };
        if (this.tenantId) {
            payload.tenantId = this.tenantId;
        }

        const token = jwt.sign(payload, this.secretKey, { algorithm: "HS512" });
        return token;
    }

    async verifyToken(token: string): Promise<{ streamId: string } | null> {
        await this.initialize();
        if (!this.secretKey) throw new Error("Auth not initialized");

        try {
            const payload = jwt.verify(token, this.secretKey, { issuer: "loghead", algorithms: ["HS512"] }) as jwt.JwtPayload;
            if (!payload.sub) return null;
            return { streamId: payload.sub };
        } catch (e) {
            console.error("Token verification failed:", e);
            return null;
        }
    }

    static decodeTokenUnsafe(token: string): any {
        return jwt.decode(token);
    }
}
