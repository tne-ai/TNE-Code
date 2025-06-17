# TNE0 - Existing Code Analysis

**Created:** 2025-01-13 10:23:42  
**Mode:** TNE0 (Document Existing Data)  
**Project:** TNE-Code VSCode Extension

## 1. Source Code Location

**Primary Source Location:** `./src/`  
**Supporting Workspaces:**

- `./webview-ui/` - React-based webview UI components
- `./packages/types` - Shared TypeScript definitions
- `./packages/cloud` - Cloud service integration (@tne-code/cloud)
- `./packages/telemetry` - Analytics and telemetry (@tne-code/telemetry)
- `./packages/ipc` - Inter-process communication (@tne-code/ipc)

## 2. Technology Stack & Architecture

### **Language & Runtime**

- **Primary Language:** TypeScript 5.8.3
- **Runtime:** Node.js 20.19.2
- **Target Platform:** VSCode Extension (VSCode ^1.84.0)

### **Build & Development Tools**

- **Package Manager:** pnpm (monorepo workspace management)
- **Build Orchestration:** Turborepo
- **Main Bundler:** esbuild (for extension), Vite (for webview UI)
- **Testing:** Vitest (preferred) + Jest (legacy)
- **Linting:** ESLint with custom config (@tne-code/config-eslint)
- **Type Checking:** TypeScript with custom config (@tne-code/config-typescript)

### **Key Dependencies & Providers**

- **AI Providers:**
    - Anthropic SDK (@anthropic-ai/sdk, bedrock, vertex)
    - OpenAI (openai ^4.78.1)
    - Google GenAI (@google/genai)
    - Mistral AI (@mistralai/mistralai)
- **MCP Integration:** @modelcontextprotocol/sdk ^1.9.0
- **VSCode Integration:** @vscode/webview-ui-toolkit, @vscode/codicons
- **Browser Automation:** puppeteer-core ^23.4.0
- **Code Analysis:** tree-sitter-wasms, web-tree-sitter
- **Environment:** @dotenvx/dotenvx for configuration

### **Frontend Stack (Webview UI)**

- **Framework:** React 18.3.1 + React DOM
- **UI Components:** Radix UI primitives + custom VSCode components
- **Styling:** Tailwind CSS 4.0.0 + VSCode theme variables
- **State Management:** @tanstack/react-query
- **Build Tool:** Vite 6.3.5
- **Development:** Storybook for component development

## 3. Program Organization & Structure

### **Extension Architecture Diagram**

```
┌─────────────────────────────────────────────────────┐
│                   VSCode Extension Host              │
├─────────────────────────────────────────────────────┤
│  src/extension.ts (Main Entry Point)                │
│  ├── Environment Loading (@dotenvx/dotenvx)         │
│  ├── Service Initialization                         │
│  │   ├── CloudService (@tne-code/cloud)             │
│  │   ├── TelemetryService (@tne-code/telemetry)     │
│  │   ├── TerminalRegistry                           │
│  │   ├── McpServerManager                           │
│  │   └── CodeIndexManager                           │
│  ├── Core Components                                │
│  │   ├── ContextProxy (config management)          │
│  │   ├── ClineProvider (webview controller)        │
│  │   └── API (IPC interface)                       │
│  └── Integrations                                   │
│      ├── Commands & Actions                         │
│      ├── Terminal Integration                       │
│      ├── Diff View Provider                        │
│      └── URI Handlers                               │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│               Webview UI (React)                    │
├─────────────────────────────────────────────────────┤
│  webview-ui/src/                                    │
│  ├── Components (Radix UI + Custom)                │
│  ├── Views (Chat, Settings, History)               │
│  ├── State Management (@tanstack/react-query)      │
│  ├── Styling (Tailwind + VSCode themes)            │
│  └── Communication (postMessage API)               │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              External Integrations                  │
├─────────────────────────────────────────────────────┤
│  ├── AI Providers (Anthropic, OpenAI, Google)      │
│  ├── MCP Servers (extensible protocol)             │
│  ├── Cloud Services (@tne-code/cloud)              │
│  ├── Browser Automation (Puppeteer)                │
│  └── File System & Terminal Integration            │
└─────────────────────────────────────────────────────┘
```

### **Core Components Structure**

```
src/
├── extension.ts                 # Main entry point & activation
├── activate/                    # Command registration & setup
├── core/
│   ├── config/ContextProxy.ts   # Configuration management
│   └── webview/ClineProvider.ts # Main webview controller
├── services/
│   ├── mcp/McpServerManager.ts  # Model Context Protocol
│   └── code-index/manager.ts    # Code indexing & search
├── integrations/
│   ├── editor/DiffViewProvider.ts # Diff view implementation
│   └── terminal/TerminalRegistry.ts # Terminal integration
├── shared/                      # Shared utilities & types
├── utils/                       # Helper functions
└── extension/api.ts             # Public API interface
```

### **Monorepo Workspace Structure**

```
tne-code/
├── src/                    # Main VSCode extension
├── webview-ui/            # React webview UI
├── packages/
│   ├── types/             # Shared TypeScript definitions
│   ├── cloud/             # Cloud service integration
│   ├── telemetry/         # Analytics & tracking
│   ├── ipc/               # Inter-process communication
│   └── build/             # Build configuration
├── apps/                  # Additional applications
├── evals/                 # Evaluation & testing scripts
└── memory-bank/           # Project documentation
```

## 4. Database Schema & Relationships

**Note:** This project does not use a traditional database. Instead, it uses:

### **Storage Mechanisms**

- **VSCode Settings:** Configuration persistence via VSCode's settings API
- **Global State:** Extension state via `vscode.ExtensionContext.globalState`
- **File System:** Local storage for conversation history, settings, and cache
- **Cloud Storage:** Optional cloud synchronization via @tne-code/cloud service

### **Data Flow Diagram**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VSCode API    │◄──►│  ContextProxy   │◄──►│  Cloud Service  │
│   (Settings)    │    │  (State Mgmt)   │    │  (Sync/Backup)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Local File      │    │ Memory Cache    │    │ Remote Storage  │
│ System          │    │ (Runtime)       │    │ (Cloud)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 5. User Interface Documentation

### **Primary Interface Components**

1. **Activity Bar Icon:** TNE-Code branded icon in VSCode activity bar
2. **Sidebar Panel:** Main chat interface with AI assistant
3. **Tab Panel:** Optional full-screen mode for extended interactions
4. **Context Menus:** Right-click actions in editor and terminal
5. **Command Palette:** Accessible commands via Ctrl/Cmd+Shift+P

### **Webview UI Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    TNE-Code Sidebar                         │
├─────────────────────────────────────────────────────────────┤
│  Header Navigation                                          │
│  ├── [+] New Task    [📁] Prompts   [🖥️] MCP Servers      │
│  ├── [📜] History    [🔗] Popout    [👤] Account          │
│  └── [⚙️] Settings                                         │
├─────────────────────────────────────────────────────────────┤
│  Chat Interface                                             │
│  ├── Message History (virtualized scrolling)               │
│  ├── Code Blocks (syntax highlighted)                      │
│  ├── Diff Views (inline file changes)                      │
│  └── Input Area (auto-resizing textarea)                   │
├─────────────────────────────────────────────────────────────┤
│  Status & Progress                                          │
│  ├── Current Task Status                                    │
│  ├── Model Provider Info                                    │
│  └── Token Usage & Costs                                    │
└─────────────────────────────────────────────────────────────┘
```

### **Screen Flow Relationships**

```
Main Sidebar ──► Settings Panel ──► Provider Configuration
     │               │                      │
     ├── New Task ───┴─► Task Creation ─────┘
     │
     ├── History ─────► Conversation History ─► Restore Session
     │
     ├── Prompts ─────► Prompt Templates ────► Quick Actions
     │
     └── MCP ─────────► Server Management ──► External Tools
```

## 6. Development & Deployment

### **How to Run the Code**

```bash
# Install dependencies
pnpm install

# Development builds
pnpm run dev                    # Start webview dev server
pnpm run watch:bundle           # Watch extension bundle
pnpm run watch:tsc              # Watch TypeScript compilation

# Testing
pnpm test                       # Run all tests
pnpm run check-types            # Type checking
pnpm run lint                   # Linting

# Production builds
pnpm run bundle                 # Bundle extension
pnpm run vsix                   # Create VSIX package
pnpm run publish:marketplace    # Publish to marketplace
```

### **Environment Variables**

- **Optional:** `.env` file for development configuration
- **Cloud Integration:** API keys for AI providers
- **Development:** `NODE_ENV=development` enables auto-reload
- **IPC:** `ROO_CODE_IPC_SOCKET_PATH` for external communication

## 7. Shortfalls & Missing Components

### **Identified Gaps**

1. **Build System:** No Makefile for unified development workflow
2. **Documentation:** Limited installation/setup documentation
3. **Testing Coverage:** Incomplete test coverage for all components
4. **Error Handling:** Some service initialization failures only log warnings
5. **Performance:** Code indexing may impact large projects
6. **Security:** Potential risks with terminal command execution

### **Technical Debt**

1. **Branding Transition:** References to "Roo Code" mixed with "TNE Code"
2. **Package Naming:** Inconsistent use of @roo-code vs @tne-code scopes
3. **Testing Framework:** Mixed Jest/Vitest usage needs standardization
4. **TypeScript:** Some `any` types could be more specific
5. **Bundle Size:** Large dependency footprint for VSCode extension

### **Missing Features**

1. **Offline Mode:** Limited functionality without internet connection
2. **Plugin System:** No formal plugin architecture beyond MCP
3. **Backup/Restore:** Manual conversation backup mechanisms
4. **Performance Monitoring:** Limited telemetry for performance issues
5. **Accessibility:** May need ARIA improvements for screen readers

## 8. Module Interrelationships

### **Internal Package Dependencies**

```
src/ (main extension)
├── depends on: @tne-code/types (shared interfaces)
├── depends on: @tne-code/cloud (cloud services)
├── depends on: @tne-code/telemetry (analytics)
├── depends on: @tne-code/ipc (communication)
└── communicates with: webview-ui/ (via postMessage)

webview-ui/
├── depends on: @tne-code/types (shared interfaces)
└── communicates with: src/ (via VSCode webview API)

packages/types/
└── provides: Shared TypeScript definitions for all workspaces

packages/cloud/
├── provides: Authentication, sync, storage services
└── depends on: @tne-code/types

packages/telemetry/
├── provides: PostHog analytics integration
└── depends on: @tne-code/types
```

### **External Integration Points**

```
TNE-Code Extension
├── VSCode Extension API (host environment)
├── AI Providers
│   ├── Anthropic (Claude models)
│   ├── OpenAI (GPT models)
│   ├── Google (Gemini models)
│   └── Mistral AI (Mistral models)
├── MCP Servers (extensible protocol)
├── Terminal Integration (shell execution)
├── File System Access (read/write operations)
├── Browser Automation (Puppeteer)
└── Cloud Services (optional sync/backup)
```

### **Communication Patterns**

1. **Extension ↔ Webview:** PostMessage API with typed interfaces
2. **Extension ↔ AI Providers:** HTTP REST APIs with SDK wrappers
3. **Extension ↔ MCP Servers:** JSON-RPC over stdio/SSE
4. **Extension ↔ VSCode:** Native Extension API
5. **Extension ↔ Terminal:** Process spawning and stdio capture
6. **Extension ↔ Cloud:** HTTP APIs with authentication

## 9. Architecture Decisions

### **Key Technical Choices**

1. **Monorepo:** Chose pnpm + Turborepo for workspace management
2. **UI Framework:** React + Radix UI for professional component library
3. **Build Tools:** esbuild for speed, Vite for modern development
4. **Testing:** Vitest migration from Jest for ESM compatibility
5. **AI Integration:** Provider abstraction pattern for multi-model support
6. **Extensibility:** MCP protocol for community-driven extensions

### **Design Patterns**

1. **Provider Pattern:** Abstract AI model providers behind common interface
2. **Service Locator:** Centralized service initialization and access
3. **Event-Driven:** Loose coupling between extension and webview
4. **Command Pattern:** VSCode command registration and handling
5. **Factory Pattern:** Dynamic creation of AI provider instances
6. **Observer Pattern:** State change notifications across components

---

**Last Updated:** 2025-01-13 10:23:42  
**Next Steps:** Create Makefile, generate AI teaching prompt, verify functionality
