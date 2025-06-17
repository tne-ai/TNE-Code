# TNE-Code VSCode Extension Makefile
# A comprehensive build and development workflow for the pnpm monorepo

.PHONY: help install dev build test lint format clean check-types bundle vsix publish

## help: Show this help message
help:
	@echo "TNE-Code Development Commands:"
	@echo ""
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'

## install: Install all dependencies and setup development environment
install:
	@echo "==> Installing dependencies with pnpm..."
	pnpm install
	@echo ""
	@echo "==> Environment Setup Notes:"
	@echo "• Optional: Create .env file in project root for development"
	@echo "• For secure environment management, consider using:"
	@echo "  - 1Password with .envrc and direnv"
	@echo "  - Export environment variables directly"
	@echo "• Required for AI providers: API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)"
	@echo "• Development mode: NODE_ENV=development enables auto-reload"
	@echo ""
	@echo "✅ Installation complete!"

## dev: Start development servers (webview + extension watch)
dev:
	@echo "==> Starting development environment..."
	@echo "• Starting webview dev server..."
	cd webview-ui && pnpm run dev &
	@echo "• Starting extension bundle watcher..."
	cd src && pnpm run watch:bundle &
	@echo "• Starting TypeScript type checking..."
	cd src && pnpm run watch:tsc &
	@echo ""
	@echo "🚀 Development servers started!"
	@echo "• Webview UI: http://localhost:5173 (if running standalone)"
	@echo "• Extension: Auto-reloading when files change"
	@echo "• Press F5 in VSCode to launch Extension Development Host"
	@echo "• Use Ctrl+C to stop all processes"

## build: Build all packages for production
build:
	@echo "==> Building all packages..."
	pnpm run build
	@echo "✅ Build complete!"

## bundle: Bundle extension for distribution
bundle:
	@echo "==> Bundling extension..."
	cd src && pnpm run bundle
	@echo "✅ Extension bundled!"

## test: Run all tests across the monorepo
test:
	@echo "==> Running tests..."
	pnpm test
	@echo "✅ Tests complete!"

## lint: Lint all source code
lint:
	@echo "==> Linting code..."
	pnpm run lint
	@echo "✅ Linting complete!"

## format: Format all source code
format:
	@echo "==> Formatting code..."
	pnpm run format
	@echo "✅ Formatting complete!"

## check-types: Run TypeScript type checking
check-types:
	@echo "==> Checking types..."
	pnpm run check-types
	@echo "✅ Type checking complete!"

## vsix: Create VSIX package for distribution
vsix: bundle
	@echo "==> Creating VSIX package..."
	cd src && pnpm run vsix
	@echo "✅ VSIX package created in ./bin/"

## publish: Publish extension to marketplace
publish: vsix
	@echo "==> Publishing to marketplace..."
	cd src && pnpm run publish:marketplace
	@echo "✅ Extension published!"

## clean: Clean all build artifacts and node_modules
clean:
	@echo "==> Cleaning build artifacts..."
	pnpm run clean
	@echo "==> Removing node_modules..."
	rm -rf node_modules
	find . -name "node_modules" -type d -prune -exec rm -rf {} +
	find . -name ".turbo" -type d -prune -exec rm -rf {} +
	@echo "✅ Cleanup complete!"

## install-tools: Install required development tools (macOS with Homebrew)
install-tools:
	@echo "==> Installing development tools..."
	@if command -v brew >/dev/null 2>&1; then \
		echo "Installing Node.js and pnpm..."; \
		brew install node@20 pnpm; \
	else \
		echo "❌ Homebrew not found. Please install:"; \
		echo "• Node.js 20.x: https://nodejs.org/"; \
		echo "• pnpm: npm install -g pnpm"; \
	fi
	@echo "✅ Tools installation complete!"

## quick-start: Complete setup from fresh clone
quick-start: install-tools install
	@echo "==> Quick start setup complete!"
	@echo "• Run 'make dev' to start development"
	@echo "• Run 'make test' to run tests"
	@echo "• Run 'make vsix' to create distributable package"