# Loghead VS Code Extension

Collects browser console logs and sends them to Loghead.

Loghead helps developers capture, organize, and send logs directly to their debugging tools and AI coding assistants while they work. Instead of jumping between terminals, cloud dashboards, and browser tabs, Loghead brings your logs into one simple flow so you can understand issues faster and fix them with less friction.

## What is Loghead?

With Loghead installed, you can collect logs from browser activity, local development, and connected environments, then forward them to tools like Cursor or other LLM based workflows. This makes debugging more practical because the context lives right where you are writing and fixing code.

[![Loghead Demo Video](https://img.youtube.com/vi/RKmlgE1mx1E/maxresdefault.jpg)](https://youtu.be/RKmlgE1mx1E)

Loghead is built for modern developers who use vibe coding and AI assisted debugging. It removes the noise from scattered logs and turns raw output into something you can reason about immediately. As a result, you spend less time searching for errors and more time shipping working code.

If you are tired of copy pasting logs, losing context, or switching tools just to understand what went wrong, Loghead gives you a faster and calmer debugging experience right inside your browser.

## Features

- **Server Management**: Connect to and manage Loghead servers
- **Project Management**: Create, view, and delete projects with ease
- **Stream Management**: Create streams, copy stream tokens, and manage stream ingestion
- **Log Viewer**: Browse and view logs from your streams in real-time
- **Actions Panel**: Quick access to common operations for faster workflows

## Requirements

- VS Code 1.107.0 or higher
- Node.js runtime for the extension to function

## Extension Settings

This extension integrates with your Loghead server through the following views:

- **Server View**: Manage server connections
- **Projects View**: Browse and manage your projects and streams
- **Actions View**: Quick access to create projects and streams
- **Logs View**: View logs from your streams

## Commands

- `Loghead: Open Dashboard` - Open the Loghead dashboard
- `Create Project` - Create a new project
- `Create Stream` - Create a new stream in a project
- `Refresh` - Refresh the project view
- `Delete Project` - Delete a project
- `Copy Stream Token` - Copy the authentication token for a stream
- `Copy Stream Ingest Command` - Copy the ingest command for a stream
- `Delete Stream` - Delete a stream

## Release Notes

### 0.0.1

Initial release of Loghead VS Code Extension with basic project and stream management capabilities.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
