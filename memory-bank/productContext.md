# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-12-06 06:27:42 - Memory Bank initialized for Roo Code VSCode Extension documentation

## Project Goal

**Roo Code** (previously Roo Cline) is an AI-powered autonomous coding agent that lives in VSCode. The goal is to provide developers with a flexible, intelligent assistant that can:

- Communicate in natural language
- Read and write files directly in workspace
- Run terminal commands
- Automate browser actions
- Integrate with OpenAI-compatible APIs and custom models
- Adapt through Custom Modes for specialized roles

## Key Features

- **Multiple Specialized Modes**: Code, Architect, Ask, Debug, Custom Modes
- **Advanced Tool Integration**: File operations, terminal commands, browser automation
- **MCP (Model Context Protocol)**: Extensible tool and resource system
- **Multi-language Support**: Localized for 15+ languages
- **Context Management**: Intelligent context condensing and management
- **Monorepo Architecture**: pnpm workspace with TypeScript, React webview
- **Comprehensive Testing**: Jest (deprecated) transitioning to Vitest

## Overall Architecture

- **VSCode Extension Core** (`src/`): TypeScript-based extension host
- **Webview UI** (`webview-ui/`): React-based user interface with Tailwind CSS
- **Shared Packages** (`packages/`): Common types and utilities
- **Documentation** (`docs/`): Comprehensive project documentation
- **Localization** (`locales/`): Multi-language support files
- **Testing Infrastructure**: Comprehensive test suites across all components
- **Development Tools**: ESLint, Prettier, Turborepo for build orchestration

2025-12-06 06:27:42 - Initial project context documented from README.md and file structure analysis
