# TNE Code VSCode Extension - Development Makefile
# 
# This Makefile provides streamlined development commands for the TNE Code extension.
# Environment variables can be set via .env files or using direnv with .envrc
# For enhanced security, consider using 1Password CLI for API key management.

.PHONY: help install dev run clean test lint format build vsix

## help: Show this help message
help:
	@echo "TNE Code Development Commands:"
	@echo ""
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'

## install: Install all dependencies and setup development environment
install:
	@echo "Installing dependencies with pnpm..."
	pnpm install
	@echo ""
	@echo "✅ Installation complete!"
	@echo ""
	@echo "Environment Variables (optional):"
	@echo "- Create .env files in workspaces or use direnv with .envrc"
	@echo "- Consider using 1Password CLI: op run --env-file=.env -- make dev"
	@echo ""
	@echo "Development Setup:"
	@echo "- Vector Database: Qdrant (see docs for setup if using code indexing)"
	@echo "- AI Providers: Configure API keys in VSCode settings"
	@echo "- MCP Servers: Optional external integrations"

## dev: Start development with file watching
dev:
	@echo "Starting development mode with file watching..."
	pnpm run watch:bundle & pnpm run watch:tsc
	
## run: Launch VSCode extension host for testing
run:
	@echo "Launching VSCode Extension Development Host..."
	@echo "Press F5 in VSCode or use 'Debug: Start Debugging' command"
	@echo "Alternatively, build and install the extension:"
	$(MAKE) vsix

## test: Run all tests across workspaces
test:
	@echo "Running tests with Turborepo..."
	pnpm test

## lint: Run linting across all workspaces
lint:
	@echo "Running ESLint across workspaces..."
	pnpm lint

## format: Format code with Prettier
format:
	@echo "Formatting code with Prettier..."
	pnpm format

## build: Build all packages and extension
build:
	@echo "Building all packages..."
	pnpm build

## bundle: Bundle extension for distribution
bundle:
	@echo "Bundling extension..."
	pnpm bundle

## vsix: Create VSCode extension package (.vsix file)
vsix: bundle
	@echo "Creating VSIX package..."
	pnpm vsix
	@echo "Extension package created in bin/ directory"
	@echo "Install with: code --install-extension bin/tne-code-*.vsix"

## clean: Clean all build artifacts and node_modules
clean:
	@echo "Cleaning build artifacts..."
	pnpm clean
	@echo "Removing node_modules..."
	find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "Clean complete!"

## check-types: Type check all TypeScript files
check-types:
	@echo "Type checking with TypeScript..."
	pnpm check-types

## update-deps: Update all dependencies
update-deps:
	@echo "Updating dependencies..."
	pnpm update --recursive

## evals: Start evaluation environment (Docker required)
evals:
	@echo "Starting evaluation environment..."
	pnpm evals