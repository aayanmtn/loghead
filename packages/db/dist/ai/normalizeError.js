export function normalizeError(message) {
    if (!message)
        return "";
    let normalized = message.toLowerCase();
    // Remove timestamps (e.g. 2023-10-25T12:00:00Z, [2023-10-25 12:00:00])
    normalized = normalized.replace(/\d{4}-\d{2}-\d{2}[t\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:z|[+-]\d{2}:\d{2})?/g, "");
    // Remove file paths (e.g. /usr/src/app/index.js, src/user.ts)
    // This is tricky, simple heuristic: look for slashes with file extensions or typical path structures
    normalized = normalized.replace(/(?:\/[a-zA-Z0-9_\-\.]+)+\.?[a-zA-Z0-9]+(?::\d+)?/g, "");
    normalized = normalized.replace(/[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.\/]+(?::\d+)?/g, "");
    // Remove line numbers (e.g. :102:45)
    normalized = normalized.replace(/:\d+(?::\d+)?/g, "");
    // Remove UUIDs
    normalized = normalized.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "");
    // Remove hex strings (e.g. 0x123abc, memory addresses)
    normalized = normalized.replace(/0x[0-9a-f]+/g, "");
    // Remove numeric identifiers (standalone numbers)
    normalized = normalized.replace(/\b\d+\b/g, "");
    // Remove generic stack trace tokens like "at ", "from " if they precede paths (already handled partly by path removal)
    // But also cleanup punctuation
    normalized = normalized.replace(/[^a-z\s]/g, " ");
    // Collapse whitespace
    normalized = normalized.replace(/\s+/g, " ").trim();
    return normalized;
}
