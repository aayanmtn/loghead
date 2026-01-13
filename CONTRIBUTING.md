# Contributing to Loghead

Thank you for your interest in contributing to Loghead! We appreciate your help in making this project better. This guide will help you get started.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:
- A clear, descriptive title
- A detailed description of the problem
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment (OS, Node.js version, etc.)

### Suggesting Features

We welcome feature suggestions! Please open an issue with:
- A clear description of the feature
- Use cases and benefits
- Possible implementation approaches (if you have ideas)

### Submitting Pull Requests

1. **Fork the repository** and clone it locally
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Set up your development environment** (see [Setup](#setup) below)
4. **Make your changes** following the [Code Style](#code-style) guidelines
5. **Test your changes** thoroughly
6. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "feat: add descriptive message"
   ```
   Use conventional commits format: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, etc.
7. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request** with:
   - A clear title describing the changes
   - A detailed description of what was changed and why
   - Reference to related issues (e.g., `Closes #123`)
   - Any breaking changes clearly noted

## Setup

### Prerequisites

Before you start, ensure you have:
- **Node.js** v18 or higher
- **npm** or **yarn**
- **Ollama**: [Download here](https://ollama.com/download)
  - Ensure it's running: `ollama serve`
  - Pull the embedding model: `ollama pull qwen3-embedding:0.6b` (or similar)
- **Git**

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/onvo-ai/loghead.git
   cd loghead
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Start the core server** (in a background terminal):
   ```bash
   npx @loghead/core
   ```

5. **Run development mode** (if applicable for the package you're working on):
   ```bash
   npm run dev
   ```

### Project Structure

Loghead is a monorepo using Turbo. Key packages:

- **`packages/core`**: Main server, database, API, and web UI
  - `src/cli_main.ts`: CLI entry point
  - `src/api/server.ts`: REST API server
  - `src/db/`: Database client and migrations
  - `frontend/`: Web UI (React/Vite)

- **`packages/mcp`**: MCP server for AI assistant integration

- **`packages/vs-code-extension`**: VS Code extension for Loghead

- **`packages/terminal`**: Terminal client

- **`packages/browser`**: Browser extension

- **`packages/docker`**: Docker support

- **`sample_apps`**: Example applications

- **`scripts`**: Build and deployment scripts

## Code Style

### TypeScript/JavaScript

- Use **TypeScript** for new files (`.ts`/`.tsx`)
- Follow **ESLint** rules (configuration in the project)
- Format code with **Prettier** if configured
- Use descriptive variable and function names
- Add JSDoc comments for public functions and exports
- Keep functions focused and single-responsibility

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Dependency updates, tooling changes
- `ci`: CI/CD configuration changes

Example:
```
feat(core): add support for filtering logs by timestamp

Add timestamp filtering capabilities to the log query API.
This allows users to retrieve logs within a specific time range.

Closes #42
```

## Testing

- Add tests for new features and bug fixes
- Run tests before submitting a PR:
  ```bash
  npm test
  ```
- Aim for good test coverage, especially for critical paths
- Use descriptive test names that explain what's being tested

## Documentation

- Update `README.md` if your changes affect setup or usage
- Add/update comments in code for complex logic
- Document new API endpoints or CLI commands
- Include examples for new features when applicable

## Development Workflow

### Build

Build all packages:
```bash
npm run build
```

Build a specific package:
```bash
cd packages/core
npm run build
```

### Local Testing

1. Make sure the core server is running
2. Test your changes in the relevant package:
   - For core changes: The server should reflect your changes
   - For MCP changes: Test with your AI assistant
   - For extension changes: Load the extension in VS Code
   - For browser changes: Load the extension in your browser

### Debugging

- Use `console.log()` or `debugger` statements
- Use VS Code's debugger with appropriate launch configurations
- Check server logs in the terminal where the core server is running

## Branching Strategy

- **main**: Stable release branch
- **feature/**: Feature branches
- **fix/**: Bug fix branches
- **docs/**: Documentation branches

Use descriptive names:
- Good: `feature/add-log-filtering`
- Good: `fix/database-connection-timeout`
- Bad: `feature/stuff`

## Release Process

(Information about releases will be added as the project evolves)

## Getting Help

- Check existing issues and pull requests
- Read the [README.md](./README.md) for setup and usage
- Ask questions in issues or discussions
- Reach out to maintainers if you're stuck

## License

By contributing to Loghead, you agree that your contributions will be licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Recognition

Contributors will be recognized and appreciated. Thank you for making Loghead better!

---

Questions? Open an issue or discussion on GitHub!
