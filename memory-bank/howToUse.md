# How to Use TNE-Code: AI Teaching Guide

**Created:** 2025-01-13 10:40:06  
**Purpose:** Teach another AI how to understand, install, develop, and work with the TNE-Code VSCode extension

---

## Project Overview

TNE-Code is a sophisticated VSCode extension that provides an AI-powered autonomous coding agent. It's built as a TypeScript monorepo using pnpm + Turborepo, with a React-based webview UI and extensive AI provider integrations.

### Key Characteristics

- **Architecture:** VSCode Extension with React webview UI
- **Language:** TypeScript 5.8.3 throughout
- **Package Management:** pnpm monorepo with Turborepo orchestration
- **AI Integration:** Multi-provider support (Anthropic, OpenAI, Google, Mistral)
- **Extensibility:** MCP (Model Context Protocol) for external tools
- **Build System:** esbuild for extension, Vite for webview UI

---

## Quick Start Guide

### 1. Initial Setup (Fresh Environment)

```bash
# Clone and enter the project
git clone https://github.com/tne-ai/TNE-Code
cd TNE-Code

# Quick setup with Makefile
make quick-start

# Or manual setup:
# Install dependencies
make install

# Start development environment
make dev
```

### 2. Project Structure Understanding

```
tne-code/
├── src/                    # Main VSCode extension (TypeScript)
│   ├── extension.ts        # Entry point & activation
│   ├── core/              # Core components (webview, config)
│   ├── services/          # MCP, code indexing, etc.
│   ├── integrations/      # Editor, terminal integration
│   └── shared/            # Utilities & shared code
├── webview-ui/            # React-based UI components
│   ├── src/              # React components & logic
│   └── package.json      # Webview-specific dependencies
├── packages/             # Shared packages
│   ├── types/           # Shared TypeScript definitions
│   ├── cloud/           # Cloud service integration
│   ├── telemetry/       # Analytics & tracking
│   └── ipc/             # Inter-process communication
├── memory-bank/         # Project documentation & context
└── Makefile            # Unified development workflow
```

### 3. Development Workflow

```bash
# Start development environment (runs 3 processes):
make dev
# → Webview dev server (Vite)
# → Extension bundle watcher (esbuild)
# → TypeScript type checking

# In VSCode:
# Press F5 to launch Extension Development Host
# Test your changes in the new VSCode window

# Run tests
make test

# Check types and lint
make check-types
make lint

# Format code
make format
```

---

## Understanding the Architecture

### Extension Flow

1. **Activation:** [`src/extension.ts`](src/extension.ts:54) initializes services
2. **Services Setup:** Cloud, telemetry, MCP servers, code indexing
3. **Webview Creation:** [`ClineProvider`](src/core/webview/ClineProvider.ts) manages UI
4. **Communication:** PostMessage API between extension and webview
5. **AI Integration:** Provider pattern abstracts different AI services

### Key Components

#### Extension Side (`src/`)

- **`extension.ts`:** Main entry point, service initialization
- **`core/webview/ClineProvider.ts`:** Primary webview controller
- **`core/config/ContextProxy.ts`:** Configuration management
- **`services/mcp/McpServerManager.ts`:** External tool integration
- **`integrations/terminal/TerminalRegistry.ts`:** Terminal interaction

#### Webview Side (`webview-ui/`)

- **React Components:** Radix UI + custom VSCode-themed components
- **State Management:** @tanstack/react-query for async state
- **Styling:** Tailwind CSS with VSCode CSS variables
- **Communication:** PostMessage API with typed interfaces

#### Shared Packages (`packages/`)

- **`@tne-code/types`:** Common interfaces and types
- **`@tne-code/cloud`:** Authentication and sync services
- **`@tne-code/telemetry`:** PostHog analytics integration

### Communication Patterns

```typescript
// Extension → Webview
webview.postMessage({
	type: "action",
	action: { type: "updateApiConfiguration", apiConfiguration },
})

// Webview → Extension
vscode.postMessage({
	type: "webviewDidLaunch",
})
```

---

## Development Tasks & Examples

### Adding a New Feature

1. **Define Types** (if needed):

    ```bash
    # Edit shared types
    vim packages/types/src/index.ts
    ```

2. **Extension Logic**:

    ```bash
    # Add to appropriate service or integration
    vim src/services/new-feature/NewFeatureManager.ts
    ```

3. **Webview UI**:

    ```bash
    # Create React components
    vim webview-ui/src/components/NewFeature.tsx
    ```

4. **Test Changes**:
    ```bash
    make dev    # Start development
    # Press F5 in VSCode to test
    ```

### Adding Dependencies

```bash
# Extension dependencies
cd src && pnpm add <package>

# Webview dependencies
cd webview-ui && pnpm add <package>

# Shared package dependencies
cd packages/types && pnpm add <package>
```

### Running Specific Tests

```bash
# All tests
make test

# Specific workspace
cd src && pnpm test

# Specific test file
cd src && npx vitest path/to/test.spec.ts

# Single test case
cd src && npx vitest path/to/test.spec.ts -t "test name"
```

---

## Build & Distribution

### Creating a Distributable Package

```bash
# Build everything
make build

# Create VSIX package
make vsix
# Output: ./bin/tne-code-<version>.vsix

# Install locally
code --install-extension ./bin/tne-code-<version>.vsix
```

### Publishing (requires credentials)

```bash
# Publish to marketplace
make publish
```

---

## Troubleshooting Common Issues

### Extension Not Loading

1. Check VSCode Developer Console: `Help > Toggle Developer Tools`
2. Look for extension activation errors
3. Verify all dependencies installed: `make install`

### Webview UI Issues

1. Check webview console in VSCode DevTools
2. Ensure webview dev server is running: `make dev`
3. Verify React build: `cd webview-ui && pnpm build`

### TypeScript Errors

```bash
# Check all type errors
make check-types

# Specific workspace
cd src && pnpm run check-types
```

### Build Failures

```bash
# Clean and rebuild
make clean
make install
make build
```

---

## Working with AI Providers

### Adding a New AI Provider

1. **Create Provider Class**:

    ```typescript
    // src/api/providers/new-provider.ts
    export class NewProvider implements ApiHandler {
    	async createMessage(
    		systemPrompt: string,
    		messages: Anthropic.Messages.MessageParam[],
    	): Promise<ApiHandlerMessageResponse> {
    		// Implementation
    	}
    }
    ```

2. **Register Provider**:

    ```typescript
    // src/api/index.ts
    case "new-provider":
      return new NewProvider(options)
    ```

3. **Add UI Configuration**:
    ```tsx
    // webview-ui/src/components/Settings/
    // Add provider-specific settings
    ```

### MCP Server Integration

1. **Server Configuration**:

    ```json
    // In VSCode settings or .env
    {
    	"tne-code.mcpServers": {
    		"server-name": {
    			"command": "node",
    			"args": ["path/to/server.js"]
    		}
    	}
    }
    ```

2. **Use MCP Tools**:
    ```typescript
    // Extension automatically discovers and uses MCP tools
    // No additional coding required for basic integration
    ```

---

## Environment Configuration

### Required Environment Variables

```bash
# AI Provider API Keys (optional for development)
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here

# Development
NODE_ENV=development  # Enables auto-reload

# IPC (optional)
ROO_CODE_IPC_SOCKET_PATH=/path/to/socket
```

### Using with direnv + 1Password

```bash
# .envrc file
export ANTHROPIC_API_KEY="op://vault/item/field"
export OPENAI_API_KEY="op://vault/item/field"

# Enable direnv
direnv allow
```

---

## Advanced Usage

### Debugging Extension

1. Open project in VSCode
2. Set breakpoints in TypeScript files
3. Press F5 to launch Extension Development Host
4. Use debugger in original VSCode window

### Webview Development

```bash
# Run webview standalone (for component development)
cd webview-ui
pnpm run dev
# Visit http://localhost:5173
```

### Performance Analysis

```bash
# Bundle analysis
cd src && pnpm run bundle -- --analyze

# Check bundle size
cd webview-ui && pnpm run build
```

---

## Testing Your Understanding

Try these exercises to verify you understand the project:

1. **Basic Setup Test**:

    ```bash
    make clean && make install && make help
    ```

2. **Development Test**:

    ```bash
    make dev
    # Verify 3 processes start successfully
    ```

3. **Build Test**:

    ```bash
    make build && make vsix
    # Verify VSIX package is created
    ```

4. **Code Exploration**:
    - Find the main extension activation function
    - Locate the webview message handling
    - Identify where AI providers are configured

---

## Key Commands Reference

| Command        | Purpose                       |
| -------------- | ----------------------------- |
| `make help`    | Show all available commands   |
| `make install` | Install dependencies          |
| `make dev`     | Start development environment |
| `make test`    | Run all tests                 |
| `make build`   | Build for production          |
| `make vsix`    | Create distributable package  |
| `make clean`   | Clean all artifacts           |

---

## Success Criteria

You understand the project when you can:

- [ ] Successfully run `make dev` and see 3 processes start
- [ ] Press F5 in VSCode and launch the Extension Development Host
- [ ] Navigate the codebase structure confidently
- [ ] Identify where to add new features or fix bugs
- [ ] Create a VSIX package with `make vsix`
- [ ] Understand the extension ↔ webview communication flow

---

**Remember:** This is a sophisticated project with many moving parts. Start with the Makefile commands, explore the code gradually, and don't hesitate to use the development tools for debugging and learning.
