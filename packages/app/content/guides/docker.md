---
title: "Docker Logging with Loghead"
description: "Centralize your containerized app's logs and pipe them directly into your AI workflow."
solutionSteps:
  - title: "Log in"
    description: "Authenticate with Loghead."
    code: "npx @loghead/core login"
  - title: "Update Docker Compose"
    description: "Update your docker-compose.yml file."
    code: "services:\n  web:\n    command: npm start | npx @loghead/terminal"
  - title: "Start Integration"
    description: "Run your containers as usual."
    code: "docker compose up"
keywords: ["docker", "containers", "logging", "microservices", "debugging"]
visuals:
  terminal:
    command: "docker compose up"
    output: "Attaching to web_1, db_1..."
    error: "db_1 exited with code 1"
    suggestion: "Check your database connection string"
---

# Docker Logging with Loghead

Managing logs in a containerized environment can be challenging. Loghead simplifies this by providing a unified stream that's ready for AI analysis.
