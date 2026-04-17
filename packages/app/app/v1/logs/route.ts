import { AuthService } from "@/lib/db/auth-service";
import { getUserDb } from "@/lib/tenant";
import { NextResponse } from "next/server";

// Helper to parse OTLP attributes
const parseOtlpAttributes = (attributes: any[]) => {
  if (!Array.isArray(attributes)) return {};
  const result: Record<string, any> = {};
  for (const attr of attributes) {
    if (attr.key && attr.value) {
      // Extract value based on type (stringValue, intValue, boolValue, etc.)
      const val = attr.value;
      if (val.stringValue !== undefined) result[attr.key] = val.stringValue;
      else if (val.intValue !== undefined)
        result[attr.key] = parseInt(val.intValue);
      else if (val.doubleValue !== undefined)
        result[attr.key] = val.doubleValue;
      else if (val.boolValue !== undefined) result[attr.key] = val.boolValue;
      else if (val.arrayValue !== undefined)
        result[attr.key] = val.arrayValue; // Simplified
      else if (val.kvlistValue !== undefined)
        result[attr.key] = val.kvlistValue; // Simplified
      else result[attr.key] = val;
    }
  }
  return result;
};

export async function POST(req: Request) {
  console.log(`[API] POST /v1/logs received`);
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[API] /v1/logs Unauthorized: Missing token");
      return NextResponse.json({ code: 16, message: "Unauthenticated" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    
    // 1. Decode token (unsafe) to get tenantId
    const decoded = AuthService.decodeTokenUnsafe(token);
    if (!decoded || !decoded.sub) {
        console.warn("[API] /v1/logs Invalid token structure");
        return NextResponse.json({ code: 16, message: "Invalid token" }, { status: 401 });
    }

    const tenantId = decoded.tenantId;
    if (!tenantId) {
         console.warn("[API] /v1/logs Token missing tenantId");
         return NextResponse.json({ code: 16, message: "Unauthorized: Token missing tenantId" }, { status: 401 });
    }

    // 2. Get the correct DB
    const db = await getUserDb(tenantId);

    // 3. Verify token
    const payload = await db.auth.verifyToken(token);
    
    if (!payload || !payload.streamId) {
      console.warn("[API] /v1/logs Unauthorized: Invalid token signature");
      return NextResponse.json({ code: 16, message: "Invalid token" }, { status: 401 });
    }

    const streamId = payload.streamId;
    console.log(`[API] Ingesting OTLP logs for stream: ${streamId}`);
    
    const body = await req.json();
    const { resourceLogs } = body;

    if (!resourceLogs || !Array.isArray(resourceLogs)) {
      console.warn("[API] /v1/logs Invalid payload");
      return NextResponse.json({ code: 3, message: "Invalid payload" }, { status: 400 });
    }

    let count = 0;
    
    for (const resourceLog of resourceLogs) {
        const resourceAttrs = parseOtlpAttributes(
          resourceLog.resource?.attributes
        );

        if (resourceLog.scopeLogs) {
          for (const scopeLog of resourceLog.scopeLogs) {
            const scopeName = scopeLog.scope?.name;

            if (scopeLog.logRecords) {
              for (const log of scopeLog.logRecords) {
                let content = "";
                if (log.body?.stringValue) content = log.body.stringValue;
                else if (log.body?.kvlistValue)
                  content = JSON.stringify(log.body.kvlistValue);
                else if (typeof log.body === "string") content = log.body; // Fallback

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
      return NextResponse.json({ partialSuccess: {}, logsIngested: count });

  } catch (e) {
    console.error("OTLP Ingest error:", e);
    return NextResponse.json({ code: 13, message: String(e) }, { status: 500 });
  }
}
