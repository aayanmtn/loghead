---
title: "How to Pretty Print JSON Logs in the Terminal"
description: "Stop reading raw JSON blobs. Learn the best tools to format and colorize structured logs in your CLI."
keywords: ["json logs", "pretty print logs", "jq", "terminal logging", "structured logging", "log formatter", "developer cli tools"]
problemTitle: "The Wall of JSON Text"
problemDescription: "Structured logging is great for machines but terrible for humans. Trying to find a specific error ID inside a massive, unformatted JSON string in your terminal is painful and slow."
solutionSteps:
  - title: "1. The naive pretty print approach"
    description: "Many developers start by calling JSON.stringify with indentation in their application code. This works for a single object but quickly becomes noisy and expensive in production."
  - title: "2. Using jq for ad hoc queries"
    description: "The classic jq tool can pretty print and query JSON logs, but the learning curve is steep and it is not optimized for continuous tailing of high volume logs."
    code: "tail -f app.log | jq '.'"
  - title: "3. Ecosystem specific prettifiers"
    description: "Libraries like pino-pretty work well if you are married to a single logging library, but they do not help when you have a mix of JSON formats from multiple sources."
    code: "node server.js | pino-pretty"
visuals:
  terminal:
    command: "cat production.json | loghead"
    output: "Formatting JSON stream..."
    error: "SyntaxError: Unexpected token in JSON at position 42"
    suggestion: "Loghead auto-corrected malformed JSON line 142"
  diagram:
    startLabel: "Raw JSON Blob"
    middleLabel: "Loghead Parser"
    endLabel: "Structured View"
    insight: "\"User ID: 5921 caused 90% of errors\""
---

Switching to JSON logs unlocks powerful observability for machines, but it ruins readability for humans.

Instead of clean lines like `GET / 200 OK`, you get this:

```json
{"level":30,"time":1638291,"pid":1,"hostname":"api-1","req":{"id":1,"method":"GET","url":"/"},"msg":"request completed"}
{"level":30,"time":1638292,"pid":1,"hostname":"api-1","req":{"id":2,"method":"POST","url":"/auth"},"msg":"authenticating"}
```

Visually scanning this for errors is impossible.

## The Wrong Way: Application-Side Formatting

Your instinct might be to use `JSON.stringify(obj, null, 2)` inside your code.

**Do not do this.**

1.  **Performance:** It increases CPU usage to format strings.
2.  **Storage:** It adds massive whitespace overhead to your logs (often 2x-3x size).
3.  **Parsing:** It breaks downstream tools (Splunk, Datadog) that expect one JSON object per line (NDJSON).

> **Pro Tip:** Always log compact, single-line JSON in production. Format it *client-side* (on your laptop) when you need to read it.

## The Classic Way: `jq`

The standard tool for this is `jq`. It's installed everywhere and incredibly powerful.

```bash
# Basic pretty printing
tail -f app.log | jq '.'

# Filter only errors
tail -f app.log | jq 'select(.level >= 50)'
```

**The Downside:** `jq` syntax is hard to remember. Writing a filter to "show me only the message and timestamp for errors" requires googling syntax every time.

## The Node.js Way: `pino-pretty`

If you use the Pino logger, `pino-pretty` is excellent.

```bash
node server.js | pino-pretty
```

It colorizes levels, formats timestamps, and highlights stack traces. But it only works well if your logs strictly follow Pino's format. If you have logs from Nginx or a Go service mixed in, it breaks.

## The Modern Way: Loghead

We built **Loghead** to be the "jq for humans". It detects log formats automatically and gives you a readable, structured view without memorizing syntax.

*   **Auto-detection:** Works with Pino, Bunyan, Zap, Zerolog, and generic JSON.
*   **AI Integration:** Pipe the pretty-printed output directly to an LLM context window.

```bash
# Pretty print any stream
cat production.log | loghead

# Ask AI to find anomalies in the JSON
cat production.log | loghead --ai "Why are requests failing?"
```

This moves you from "reading raw data" to "getting answers."
