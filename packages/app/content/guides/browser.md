---
title: "Loghead in the Browser"
description: "Stream your browser's console logs and network activity to your AI assistant."
solutionSteps:
  - title: "Install Browser Extension"
    description: "Search for 'Loghead' in the Chrome Web Store and install it."
  - title: "Connect to Account"
    description: "Log in with your Loghead account."
    code: "npx @loghead/core login"
  - title: "Enable Capture"
    description: "Turn on log capture in the extension settings."
    code: "loghead.capture(true)"
keywords: ["browser", "chrome", "console", "network", "client-side", "debugging"]
visuals:
  terminal:
    command: "npx @loghead/terminal"
    output: "Browser session active..."
    error: "Uncaught ReferenceError: api_endpoint is not defined"
    suggestion: "Check your environment variables in .env.local"
---

# Logging from the Browser

Loghead's browser integration makes it easy to capture console logs, network activity, and client-side errors, and feed them into your AI workflow.
