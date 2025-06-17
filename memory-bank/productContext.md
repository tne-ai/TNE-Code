# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-01-13 10:21:45 - Log of updates made will be appended as footnotes to the end of this file.

## Project Goal

TNE-Code is a sophisticated AI-powered VSCode extension that serves as an autonomous coding agent. The project aims to provide developers with an intelligent assistant capable of understanding, writing, debugging, and explaining code across multiple programming languages and frameworks.

## Key Features

- **Multi-Mode AI Assistant**: Specialized modes for different tasks (Code, Debug, Architect, Ask, etc.)
- **VSCode Integration**: Deep integration with VSCode editor, terminal, and file system
- **Model Context Protocol (MCP)**: Extensible server system for additional AI capabilities
- **Task Management**: Hierarchical task system with subtasks and checkpoints
- **Browser Automation**: Built-in browser control for web development tasks
- **Real-time Collaboration**: Cloud integration for sharing and collaboration
- **Diff Management**: Advanced file editing with diff preview capabilities
- **Terminal Integration**: Execute and manage terminal commands
- **Multi-Provider Support**: Support for various AI providers (Anthropic, OpenAI, etc.)

## Overall Architecture

- **Monorepo Structure**: pnpm + Turborepo for workspace management
- **TypeScript**: Primary language for all components
- **VSCode Extension API**: Core extension functionality
- **React Webview**: User interface components
- **Shared Packages**: Common types, cloud services, telemetry
- **MCP Integration**: External server protocol for extensibility
- **Provider Architecture**: Abstracted AI model providers
- **Task System**: Hierarchical task execution with state management
