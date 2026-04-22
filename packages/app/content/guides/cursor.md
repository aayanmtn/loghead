---
title: "Connecting Loghead to Cursor"
description: "Supercharge Cursor's built-in AI with real-time logs from your application."
solutionSteps:
  - title: "Open Cursor"
    description: "Launch Cursor and open your project."
  - title: "Install Loghead CLI"
    description: "If you haven't already, install the core CLI tool."
    code: "npm install -g @loghead/core"
  - title: "Stream to Loghead"
    description: "Pipe your dev server logs to Loghead."
    code: "npm run dev | npx @loghead/terminal"
keywords: ["cursor", "ai editor", "logging", "debugging", "context"]
visuals:
  terminal:
    command: "npm run dev | npx @loghead/terminal"
    output: "Cursor connection active..."
    error: "404 Not Found: /api/users"
    suggestion: "Check your route definitions in routes/api.ts"
---

# Using Loghead with Cursor

Cursor is a fork of VS Code optimized for AI-first development. Loghead fits perfectly into this workflow by providing the execution context that static analysis alone cannot provide.

## Why it matters

When you ask Cursor to "Fix this error," it looks at your source code. But if the error is data-dependent or environment-specific, the code isn't enough. Loghead provides the missing link: the actual runtime logs.
