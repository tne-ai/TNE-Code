# System Patterns

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-01-13 10:23:15 - Log of updates made.

## Coding Patterns

- TypeScript throughout the entire codebase for type safety
- Monorepo structure with pnpm workspace management
- Shared packages using `@tne-code/` scope for internal dependencies
- Vitest for testing (preferred) with some legacy Jest tests

## Architectural Patterns

- VSCode Extension API as the foundation
- Provider pattern for AI model abstraction (Anthropic, OpenAI, etc.)
- Mode-based architecture for specialized task handling
- MCP (Model Context Protocol) for extensible server integrations
- React-based webview UI components
- Event-driven communication between extension and webview

## Testing Patterns

- `.spec.ts` files for vitest (preferred)
- `.test.ts` files for legacy Jest tests
- Test execution using workspace-specific commands with `<cwd>workspace/directory</cwd>`
- Individual test targeting for debugging and fixes
