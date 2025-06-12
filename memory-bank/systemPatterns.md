# System Patterns

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-12-06 06:29:59 - Memory Bank initialization finalizing

## Coding Patterns

**TypeScript Configuration:**

- Monorepo structure with shared [`packages/types`](packages/types) for DTOs
- ESLint configuration in [`src/eslint.config.mjs`](src/eslint.config.mjs)
- Jest configuration transitioning to Vitest in [`src/jest.config.mjs`](src/jest.config.mjs)

**Testing Patterns:**

- **Legacy:** [`*.test.ts`](src/__tests__/) files using Jest (deprecated)
- **Current:** [`*.spec.ts`](src/__tests__/) files using Vitest (preferred)
- Test organization: [`__tests__`](src/__tests__/) directories within modules
- Mocking strategy: [`__mocks__`](src/services/glob/__mocks__/) for service abstraction

**File Organization:**

- Extension core: [`src/`](src/) - TypeScript extension host logic
- User interface: [`webview-ui/`](webview-ui/) - React-based webview components
- Shared utilities: [`packages/`](packages/) - Cross-workspace dependencies
- Documentation: [`docs/`](docs/) - Project documentation and guides

## Architectural Patterns

**VSCode Extension Architecture:**

- **Activation**: Entry point in [`src/activate/index.ts`](src/activate/index.ts)
- **Commands**: Registration in [`src/activate/registerCommands.ts`](src/activate/registerCommands.ts)
- **Code Actions**: Provider in [`src/activate/CodeActionProvider.ts`](src/activate/CodeActionProvider.ts)
- **Services**: Modular services in [`src/services/`](src/services/) directory

**Monorepo Management:**

- **Package Manager**: pnpm with [`pnpm-workspace.yaml`](pnpm-workspace.yaml)
- **Build Orchestration**: Turborepo via [`turbo.json`](turbo.json)
- **Workspace Rules**: Primary workspaces (src/, webview-ui/, packages/types)

**Internationalization:**

- **Localization**: [`locales/`](locales/) with 15+ language support
- **NLS Files**: [`src/package.nls.*.json`](src/) for extension manifest translations
- **i18n Setup**: [`src/i18n/`](src/i18n/) infrastructure

## Testing Patterns

**Current State (Transition Period):**

- Jest-based tests (`.test.ts`) - Legacy, being phased out
- Vitest-based tests (`.spec.ts`) - Current standard
- Test command: `pnpm test` (runs from root workspace)

**Testing Strategy:**

- Unit tests for core services and utilities
- Integration tests for extension activation and command handling
- Webview component testing (React components)
- Service mocking patterns for external dependencies

**Best Practices:**

- Use `<cwd>workspace/directory</cwd>` for test execution
- Target specific failing tests with substring matching
- Maintain test coverage for all code changes
- Prefer Vitest for new test development

2025-12-06 06:29:59 - Initial system patterns documented from project structure analysis
