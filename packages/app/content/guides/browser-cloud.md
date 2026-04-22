---
title: "Ingesting Browser Logs with Loghead Cloud"
description: "A step-by-step guide to capturing and streaming browser logs directly to the Loghead Cloud UI using the Loghead Collector extension."

solutionSteps:
  - title: "Install the Loghead Collector Extension"
    description: "Go to the [Chrome Web Store](https://chromewebstore.google.com/detail/loghead-collector/hkbdmjhpeafcmpbgpiojkpapdglfdjci) and add the 'Loghead Collector' extension to your browser."
    image: "/images/loghead-collector-chrome-extension.png"
    caption: "Loghead Collector extension on the Chrome Web Store"

  - title: "Create a Browser Stream"
    description: "In your Loghead Cloud dashboard, navigate to your project and create a new stream. Select 'Browser' as the stream type."
    image: "/images/browser-stream-creation.png"
    caption: "Creating a new browser stream in the Loghead Cloud dashboard"

  - title: "Connect the Extension to Loghead Cloud"
    description: "Click on the Loghead Collector extension in your browser. Paste 'https://www.loghead.dev' into the SERVER URL field and click Next."
    image: "/images/server-url-paste.png"
    caption: "Pasting the server URL in the Loghead Collector extension"

  - title: "Select Your Project and Stream"
    description: "The extension will fetch your available projects. Select the project you are working on, and then select the browser stream you just created."
    image: "/images/select-project-and-browser-strema.png"
    caption: "Selecting the project and browser stream in the extension"

  - title: "Start Ingesting Logs"
    description: "Click 'Connect' to establish the connection. Once connected, reload your web page. The Loghead Collector will automatically start capturing and streaming browser console logs to Loghead Cloud."
    image: "/images/stream-browser-extension-connected.png"
    caption: "Loghead Collector successfully connected and streaming logs"

keywords:
  ["browser", "console logs", "ingestion", "chrome extension", "setup", "loghead-cloud", "frontend"]

visuals:
  browser:
    action: "Reload page after connection"
    output: "[Loghead] Streaming browser console logs...\n[Loghead] Successfully ingested console logs."
    error: ""
    suggestion: ""
---

# Seamless Browser Console Logging in Loghead Cloud

Streaming browser logs to Loghead Cloud provides real-time observability for your frontend applications, allowing you to capture console errors, warnings, and informational logs directly from your users' browsers or your own testing environments.

### Why Ingest Browser Logs?

When debugging frontend issues, reproducing console errors across different environments can be challenging. By using the Loghead Collector extension to pipe browser console output directly to Loghead Cloud, you gain:

- **Centralized storage** for all your frontend console logs without modifying your app's codebase.
- **Powerful search** to quickly identify JavaScript errors, failed network requests, or warnings.
- **Easy debugging** across local development, staging, and production environments.

### Getting Started via the UI

By following the solution steps above, you can securely stream any browser console output directly into your cloud dashboard. After successfully sending your first browser logs by reloading the page, try exploring the **Search** and **Analytics** tabs in the Loghead Cloud UI to filter your frontend logs by severity, timestamp, and specific keywords.
