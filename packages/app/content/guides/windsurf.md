---
title: "Connecting Loghead to Windsurf"
description: "Stream your logs directly into Windsurf's agentic IDE for context-aware coding."
solutionSteps:
  - title: "Open Windsurf"
    description: "Launch Windsurf and open your project."
  - title: "Configure Loghead"
    description: "Add your Loghead API key to your environment."
    code: "export LOGHEAD_API_KEY=your_key"
  - title: "Start Integration"
    description: "Pipe your dev server logs to Loghead."
    code: "npm run dev | npx @loghead/terminal"
keywords: ["windsurf", "agentic ide", "logging", "debugging", "context"]
visuals:
  terminal:
    command: "npm run dev | npx @loghead/terminal"
    output: "Windsurf integration active..."
    error: "TypeError: Cannot read property 'id' of undefined"
    suggestion: "Check if the user object is properly loaded"
---

# Using Loghead with Windsurf

Windsurf's agentic capabilities represent the next step in IDE evolution. Loghead provides the necessary runtime data to make those agents even more effective.
