// Helper to parse OTLP attributes
export const parseOtlpAttributes = (attributes) => {
    if (!Array.isArray(attributes))
        return {};
    const result = {};
    for (const attr of attributes) {
        if (attr.key && attr.value) {
            // Extract value based on type (stringValue, intValue, boolValue, etc.)
            const val = attr.value;
            if (val.stringValue !== undefined)
                result[attr.key] = val.stringValue;
            else if (val.intValue !== undefined)
                result[attr.key] = parseInt(val.intValue);
            else if (val.doubleValue !== undefined)
                result[attr.key] = val.doubleValue;
            else if (val.boolValue !== undefined)
                result[attr.key] = val.boolValue;
            else if (val.arrayValue !== undefined)
                result[attr.key] = val.arrayValue; // Simplified
            else if (val.kvlistValue !== undefined)
                result[attr.key] = val.kvlistValue; // Simplified
            else
                result[attr.key] = val;
        }
    }
    return result;
};
export async function ingestCustomLogs(body, token, db, auth) {
    const payload = await auth.verifyToken(token);
    if (!payload || !payload.streamId) {
        throw new Error("Unauthorized: Invalid token");
    }
    const { streamId, logs } = body;
    console.log(`[API] Ingesting logs for stream: ${streamId}`);
    if (payload.role !== "admin" && streamId !== payload.streamId) {
        throw new Error("Forbidden: Token does not match streamId");
    }
    if (!logs) {
        throw new Error("Missing logs");
    }
    const logEntries = Array.isArray(logs) ? logs : [logs];
    console.log(`[API] Processing ${logEntries.length} log entries`);
    for (const log of logEntries) {
        let content = "";
        let metadata = {};
        if (typeof log === "string") {
            content = log;
        }
        else if (typeof log === "object") {
            content = log.content || JSON.stringify(log);
            metadata = log.metadata || {};
        }
        if (content) {
            await db.addLog(streamId, content, metadata);
        }
    }
    console.log(`[API] /api/ingest Successfully added ${logEntries.length} logs`);
    return { success: true, count: logEntries.length };
}
export async function ingestOtlpLogs(body, token, db, auth) {
    const payload = await auth.verifyToken(token);
    if (!payload || !payload.streamId) {
        throw new Error("Unauthorized: Invalid token");
    }
    const streamId = payload.streamId;
    console.log(`[API] Ingesting OTLP logs for stream: ${streamId}`);
    const { resourceLogs } = body;
    if (!resourceLogs || !Array.isArray(resourceLogs)) {
        throw new Error("Invalid payload");
    }
    let count = 0;
    for (const resourceLog of resourceLogs) {
        const resourceAttrs = parseOtlpAttributes(resourceLog.resource?.attributes);
        if (resourceLog.scopeLogs) {
            for (const scopeLog of resourceLog.scopeLogs) {
                const scopeName = scopeLog.scope?.name;
                if (scopeLog.logRecords) {
                    for (const log of scopeLog.logRecords) {
                        let content = "";
                        if (log.body?.stringValue)
                            content = log.body.stringValue;
                        else if (log.body?.kvlistValue)
                            content = JSON.stringify(log.body.kvlistValue);
                        else if (typeof log.body === "string")
                            content = log.body; // Fallback
                        const logAttrs = parseOtlpAttributes(log.attributes);
                        // Merge attributes: Resource > Scope (if any) > Log
                        const metadata = {
                            ...resourceAttrs,
                            ...logAttrs,
                            severity: log.severityText || log.severityNumber,
                            scope: scopeName,
                            timestamp: log.timeUnixNano,
                        };
                        if (content) {
                            await db.addLog(streamId, content, metadata);
                            count++;
                        }
                    }
                }
            }
        }
    }
    console.log(`[API] /v1/logs Ingested ${count} logs`);
    return { partialSuccess: {}, logsIngested: count };
}
