# @loghead/core

Core API and Database for Loghead

## Overview

`@loghead/core` provides the foundational components for the Loghead logging platform, including:
- **API Server** - Express-based REST API for managing logs
- **Database Client** - SQLite database integration with vector search capabilities
- **CLI Interface** - Command-line tools for starting the server and UI
- **Authentication** - JWT-based authentication service
- **Ollama Integration** - Integration with Ollama for AI/ML capabilities

## Installation

```bash
npm install @loghead/core
```

## Usage

### CLI Commands

Start the Loghead server:
```bash
loghead start
```

Launch the web UI:
```bash
loghead ui
```

### As a Module

```javascript
import { /* exported functions */ } from '@loghead/core';
```

## Package Contents

### Files Included

This package includes:
- **`dist/`** - Compiled JavaScript output ready for production
- **`build/npm/`** - NPM-specific build artifacts

### Dependencies

#### Production
- `better-sqlite3` - SQLite database driver
- `chalk` - Terminal styling
- `cli-table3` - CLI table formatting
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `express` - Web framework
- `inquirer` - Interactive CLI prompts
- `jsonwebtoken` - JWT authentication
- `ollama` - Ollama AI integration
- `open` - Open URLs/files
- `sqlite-vec` - Vector search for SQLite
- `yargs` - CLI argument parsing

#### Development
- `@types/*` - TypeScript type definitions
- `tsx` - TypeScript executor

## Entry Points

- **Main Export**: `dist/index.js`
- **CLI Entry Point**: `dist/cli_main.js`
- **Binary**: `loghead` command

## Building

```bash
npm run build
```

This runs:
1. Frontend build: `npm run build:frontend`
2. TypeScript compilation: `tsc`

## Development

```bash
npm run dev
```

Watch mode for continuous development with `tsx watch`.

## Scripts

- `npm start` - Start the server
- `npm run ui` - Launch the UI
- `npm run build` - Build the project
- `npm run dev` - Development mode with watch
- `npm run deploy` - Publish to npm registry

## Repository

- **GitHub**: https://github.com/onvo-ai/loghead
- **Issues**: https://github.com/onvo-ai/loghead/issues
- **Homepage**: https://github.com/onvo-ai/loghead#readme

## License

See LICENSE file in repository.
