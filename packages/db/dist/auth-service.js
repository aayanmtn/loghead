import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
export class AuthService {
    db;
    secretKey = null;
    tenantId;
    constructor(db) {
        this.db = db;
    }
    setTenantId(id) {
        this.tenantId = id;
    }
    async initialize() {
        if (this.secretKey)
            return;
        // Try to load secret from DB
        const row = await this.db.get("SELECT value FROM system_config WHERE key = 'jwt_secret'");
        let rawSecret = row?.value;
        if (!rawSecret) {
            // Generate new secret
            rawSecret = randomBytes(64).toString('hex');
            await this.db.run("INSERT INTO system_config (key, value) VALUES ('jwt_secret', ?)", [rawSecret]);
        }
        this.secretKey = rawSecret;
    }
    async getOrCreateMcpToken() {
        await this.initialize();
        if (!this.secretKey)
            throw new Error("Auth not initialized");
        // Check if token exists in DB
        const row = await this.db.get("SELECT value FROM system_config WHERE key = 'mcp_token'");
        if (row?.value) {
            const decoded = jwt.decode(row.value);
            if (!this.tenantId || (decoded && decoded.tenantId === this.tenantId)) {
                return row.value;
            }
        }
        // Create new token
        // A system token that has access to everything (conceptually)
        const payload = { sub: "system:mcp", iss: "loghead", role: "admin" };
        if (this.tenantId) {
            payload.tenantId = this.tenantId;
        }
        const token = jwt.sign(payload, this.secretKey, { algorithm: "HS512" });
        // Update or Insert
        if (row) {
            await this.db.run("UPDATE system_config SET value = ? WHERE key = 'mcp_token'", [token]);
        }
        else {
            await this.db.run("INSERT INTO system_config (key, value) VALUES ('mcp_token', ?)", [token]);
        }
        return token;
    }
    async createStreamToken(streamId) {
        await this.initialize();
        if (!this.secretKey)
            throw new Error("Auth not initialized");
        const payload = { sub: streamId, iss: "loghead" };
        if (this.tenantId) {
            payload.tenantId = this.tenantId;
        }
        const token = jwt.sign(payload, this.secretKey, { algorithm: "HS512" });
        return token;
    }
    async verifyToken(token) {
        await this.initialize();
        if (!this.secretKey)
            throw new Error("Auth not initialized");
        try {
            const payload = jwt.verify(token, this.secretKey, { issuer: "loghead", algorithms: ["HS512"] });
            if (!payload.sub)
                return null;
            return { streamId: payload.sub, role: payload.role };
        }
        catch (e) {
            console.error("Token verification failed:", e);
            return null;
        }
    }
    static decodeTokenUnsafe(token) {
        return jwt.decode(token);
    }
}
