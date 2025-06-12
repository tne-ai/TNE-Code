# TNE Code - Existing Code Analysis

Comprehensive analysis of the TNE Code VSCode extension codebase.
2025-12-06 06:30:56 - Initial code analysis from project configuration files

## 1. Source Code Location

**Primary Location**: [`src/`](src/) directory

- Main extension source code in TypeScript
- Entry point: [`src/activate/index.ts`](src/activate/index.ts)
- Extension manifest: [`src/package.json`](src/package.json)
- Build output: `src/dist/extension.js`

## 2. Technology Stack & Tooling

### Core Technologies

- **Language**: TypeScript 5.8.3
- **Runtime**: Node.js 20.19.2
- **Package Manager**: pnpm 10.8.1
- **Build Orchestration**: Turborepo 2.5.3
- **Bundler**: esbuild 0.25.0
- **Platform**: VSCode Extension API ^1.84.0

### Development Tools

- **Linting**: ESLint 9.27.0
- **Formatting**: Prettier 3.4.2
- **Testing**: Jest 29.7.0 (legacy) + Vitest 3.1.3 (current)
- **Type Checking**: TypeScript compiler
- **Git Hooks**: Husky 9.1.7 + lint-staged 16.0.0

### AI Provider Integrations

- **Anthropic**: @anthropic-ai/sdk 0.37.0, Bedrock, Vertex
- **OpenAI**: openai 4.78.1
- **Google**: @google/genai 1.0.0, google-auth-library 9.15.1
- **Mistral**: @mistralai/mistralai 1.3.6
- **AWS**: @aws-sdk/client-bedrock-runtime 3.779.0

### Specialized Libraries

- **MCP**: @modelcontextprotocol/sdk 1.9.0
- **GraphAI**: Multiple @graphai/\* packages 2.0.x
- **Browser Automation**: puppeteer-core 23.4.0
- **Code Parsing**: tree-sitter-wasms 0.1.11, web-tree-sitter 0.22.6
- **Vector Database**: @qdrant/js-client-rest 1.14.0
- **Document Processing**: pdf-parse, mammoth, turndown, cheerio

## 3. Monorepo Organization Structure

### Workspace Configuration ([`pnpm-workspace.yaml`](pnpm-workspace.yaml))

```yaml
packages:
    - "src" # Main VSCode extension
    - "webview-ui" # React-based webview
    - "apps/*" # Additional applications
    - "packages/*" # Shared packages and utilities
```

### Workspace Dependencies

- **@tne-code/types**: Shared TypeScript types and DTOs
- **@tne-code/cloud**: Cloud service integration
- **@tne-code/ipc**: Inter-process communication
- **@tne-code/telemetry**: Usage analytics
- **@tne-code/build**: Build configurations
- **@tne-code/config-eslint**: Shared ESLint config
- **@tne-code/config-typescript**: Shared TypeScript config

### Build Pipeline ([`turbo.json`](turbo.json))

```json
{
	"tasks": {
		"lint": {},
		"check-types": {},
		"test": { "dependsOn": ["@tne-code/types#build"] },
		"format": {},
		"build": { "outputs": ["dist/**"] },
		"clean": { "cache": false }
	}
}
```

## 4. Program Organization & Structure

### Extension Architecture

```
src/
├── activate/                 # Extension activation logic
│   ├── index.ts             # Main activation exports
│   ├── handleUri.ts         # URI protocol handling
│   ├── registerCommands.ts  # Command registration
│   ├── registerCodeActions.ts # Code action providers
│   ├── registerTerminalActions.ts # Terminal integrations
│   └── CodeActionProvider.ts # VSCode code action implementation
├── services/                # Core business logic services
│   ├── browser/             # Browser automation (Puppeteer)
│   ├── checkpoints/         # State management & checkpoints
│   ├── code-index/          # Code indexing & vector search
│   ├── glob/                # File system operations
│   ├── mcp/                 # Model Context Protocol integration
│   ├── ripgrep/             # Fast text search
│   ├── search/              # File search utilities
│   └── tree-sitter/         # Code parsing & analysis
├── shared/                  # Shared utilities
├── api/                     # External API integrations
├── i18n/                    # Internationalization
└── assets/                  # Static resources
```

### VSCode Extension Manifest ([`src/package.json`](src/package.json))

**Extension Identity**:

- Name: "tne-code"
- Publisher: "tne-ai"
- Display Name: Localized via "%extension.displayName%"
- Version: 0.0.2
- Repository: https://github.com/tne-ai/TNE-Code

**Key Features**:

- **Activity Bar Integration**: Custom activity bar with webview panel
- **Command Palette**: 15+ commands for AI assistance and code actions
- **Context Menus**: Editor and terminal right-click integrations
- **Code Actions**: Explain, fix, improve code functionality
- **Terminal Actions**: Command explanation and debugging
- **Settings**: Configurable AI model selection and storage paths

**View Contributions**:

- Activity Bar Container: "tne-code-ActivityBar"
- Webview Panel: "tne-code.SidebarProvider"
- Tab Panel: "tne-code.TabPanelProvider"

## 5. Database Schema & Relationships

### Vector Database (Qdrant Integration)

- **Purpose**: Code indexing and semantic search
- **Client**: @qdrant/js-client-rest 1.14.0
- **Location**: [`src/services/code-index/vector-store/`](src/services/code-index/vector-store/)
- **Schema**: Code embeddings with metadata for semantic code search

### Local Storage

- **VSCode Settings**: Extension configuration via VSCode settings API
- **Task History**: Local storage for conversation history
- **Checkpoints**: State snapshots for task resumption
- **MCP Settings**: Model Context Protocol server configurations

### File System Database

- **Config Files**: JSON-based configuration storage
- **Cache**: Temporary data and build artifacts
- **Global Storage**: VSCode global storage for cross-workspace data

## 6. User Interface Documentation

### Webview Architecture

- **Framework**: React (in [`webview-ui/`](webview-ui/) workspace)
- **Styling**: Tailwind CSS with VSCode theme integration
- **Communication**: VSCode webview message passing API

### Main UI Components

1. **Activity Bar Icon**: Entry point to extension
2. **Sidebar Panel**: Primary chat interface with AI assistant
3. **Tab Panel**: Dedicated editor tab for extended conversations
4. **Context Menus**: Quick actions in editor and terminal
5. **Command Palette**: All extension commands accessible via Ctrl/Cmd+Shift+P

### Button Actions (Toolbar)

- **Plus (+)**: Create new task/conversation
- **Server**: MCP server management
- **Organization**: Prompts and templates
- **History**: Previous conversations
- **External Link**: Open in new tab
- **Account**: TNE Code Cloud features (when enabled)
- **Settings**: Extension configuration

### Command Categories

- **Code Actions**: explainCode, fixCode, improveCode, addToContext
- **Terminal Actions**: addToContext, fixCommand, explainCommand
- **Navigation**: newTask, openInNewTab, focusInput, acceptInput
- **Management**: setCustomStoragePath, settings management

## 7. Identified Shortfalls & Missing Components

### Missing Development Infrastructure

- ❌ **No Makefile**: Missing streamlined development workflow automation
- ❌ **No .env Template**: Environment variables not documented
- ❌ **Limited Documentation**: API documentation and architecture guides needed

### Testing Gaps

- ⚠️ **Test Migration**: Jest to Vitest transition incomplete
- ⚠️ **Coverage Reporting**: Test coverage metrics not clearly defined
- ⚠️ **Integration Tests**: Browser automation and MCP integration testing

### Build & DevOps

- ⚠️ **Local Development**: No simple `make run` for development
- ⚠️ **Environment Setup**: Complex bootstrap process in scripts/
- ⚠️ **Database Setup**: Qdrant vector database setup not automated

### Security & Privacy

- ⚠️ **API Key Management**: No standardized secret management
- ⚠️ **MCP Security**: External server integration security model
- ⚠️ **Cloud Integration**: Optional cloud features need privacy review

## 8. Module Interrelationships

### Core Dependencies Flow

```
Extension Host (src/)
├── Webview UI (webview-ui/)
├── Shared Types (@tne-code/types)
├── Cloud Services (@tne-code/cloud)
├── Telemetry (@tne-code/telemetry)
└── Build Config (@tne-code/build)
```

### Service Architecture

```
Extension Activation
├── Command Registration → VSCode API
├── Code Actions → Tree-sitter + AI Providers
├── MCP Integration → External Servers
├── Browser Service → Puppeteer automation
├── Code Index → Qdrant + Embeddings
└── File Operations → Ripgrep + Glob
```

### AI Provider Integration

```
AI Request Flow:
User Input → Extension → Provider SDK → External API
                    ↓
            MCP Server Integration (optional)
                    ↓
            Response Processing → Webview UI
```

2025-12-06 06:30:56 - Comprehensive existing code analysis completed based on project configuration and structure

# TNE Code Extension - Existing Code Analysis

[2025-12-06 06:44:29] - Initial analysis of TNE research mode system and mode configuration

## TNE Research Mode System Analysis

### Location

- **Primary Configuration**: [`src/shared/modes.ts`](src/shared/modes.ts:2330-2393)
- **Lines**: 2330-2393 (TNE mode definitions)

### TNE Workflow Architecture

The TNE system implements a comprehensive 6-phase project planning workflow:

1. **[`tne-product-research`](src/shared/modes.ts:2331)** - 🔍 1. TNE - Product Research
2. **[`tne-report-reco`](src/shared/modes.ts:2341)** - 📊 2. TNE - Technical Reports
3. **[`tne-business-decisions`](src/shared/modes.ts:2352)** - 💼 3. TNE - Business Memos
4. **[`tne-project-brief`](src/shared/modes.ts:2363)** - 🏗️ 4. TNE - Project Brief
5. **[`tne-skeptic`](src/shared/modes.ts:2374)** - 🤔 5. TNE - Skeptic
6. **[`tne-customer-presentation`](src/shared/modes.ts:2384)** - ✨ 6. TNE - Customer Presentations

### TNE Product Research Mode Details

**Configuration**:

- **Slug**: `tne-product-research`
- **Name**: "🔍 1. TNE - Product Research"
- **Groups**: `["read", "edit", "browser", "command", "mcp"]` (Full tool access)
- **Role Definition**: `"You are an expert in the listed TOPIC or APPLICATION."` ⚠️ **INCONSISTENCY FOUND**
- **Memory Bank Integration**: Saves to `memory_bank/tne-product-research.md`

**Process Steps**: 0. Explain APPLICATION/TOPIC
0.5. Determine business requirements

1. Best AI techniques research
2. Open source models analysis (including multimodal LLMs)
   2a. GitHub model discovery
3. Proprietary/cloud systems evaluation
4. ArXiv research paper analysis
5. Ensemble technique design
6. Standard datasets and metrics identification
   6a. Competitive product analysis
7. URL validation and citation checking

### Mode System Inconsistency

**Issue Found**: The [`tne-product-research`](src/shared/modes.ts:2333) mode has inconsistent role definition:

**Current**: `"You are an expert in the listed TOPIC or APPLICATION."`
**Should be**: `"You are TNE-Code, an expert in the listed TOPIC or APPLICATION."`

All other TNE modes correctly use "TNE-Code" format, but this one is missing the branding consistency.

### Workflow Integration

- Each mode references the complete workflow in `whenToUse` field
- Sequential progression: `tne-product-research --> tne-report-reco --> tne-business-decisions --> tne-project-brief --> tne-skeptic --> tne-customer-presentation`
- Memory bank integration throughout workflow
- Each phase reads from previous phases' memory bank files
