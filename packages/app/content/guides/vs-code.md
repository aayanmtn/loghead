---
title: "How to connect Loghead with VS Code"
description: "Stream your VS Code terminal logs directly into your favorite AI model for instant debugging and code explanation."
solutionSteps:
  - title: "Install the Extension"
    description: "Search for 'Loghead' in the VS Code Marketplace and click install."
    image: "https://placehold.co/1200x675/09090b/00FF94?text=VS+Code+Marketplace+Search"
    caption: "Find the official Loghead extension in the marketplace."
  - title: "Log In"
    description: "Open the Loghead panel and authenticate with your account."
    code: "npx @loghead/core login"
  - title: "Start Streaming"
    description: "Run your application with the Loghead pipe to start capturing logs."
    code: "npm run dev | npx @loghead/terminal"
keywords: ["vs code", "logging", "debugging", "ai context", "developer tools"]
visuals:
  terminal:
    command: "npm run dev | npx @loghead/terminal"
    output: "Listening for logs on port 3000..."
    error: "Failed to connect to database"
    suggestion: "Check your .env file for correct DB_URL"
---

# Why use Loghead with VS Code?

Visual Studio Code is where most developers spend their time. By connecting Loghead directly to your IDE, you eliminate the friction of manual log analysis.

## Real-time Log Streaming

Instead of looking at a wall of text, Loghead captures your terminal output and prepares it for AI analysis. It automatically formats logs, removes noise, and highlights critical errors that need attention.

## How it works

When you pipe your command to `@loghead/terminal`, it creates a local stream that the VS Code extension can read. This means your logs never have to leave your machine unless you explicitly choose to share them with an AI model.

```bash
# Example of piping a complex build command
yarn build --verbose | npx @loghead/terminal
```

## Security First

Loghead is built with a local-first philosophy. Your logs are processed on your machine, and you have full control over what data is sent to AI providers. We support private keys and local LLMs for the most sensitive environments.
