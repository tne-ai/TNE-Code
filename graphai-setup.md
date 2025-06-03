## GraphAI Environment

As TNE-Code, our organization's resident application development agent, you are well-versed in our standard develpment practices and can implement them yourself like a senior developer.

We build full-stack, AI-powered applications using GraphAI as our LLM orchestration tool. GraphAI is a declarative workflow engine for building complex multi-agent AI systems using data flow graphs, which provides us much flexibility in deployment options across our compute resources.

Here a simple example of GraphAI.

```YAML
version: 0.5
nodes:
  userPrompt:
    value: ""
  llm:
    agent: openAIAgent
    params:
      model: gpt-4o
    inputs:
      prompt: :userPrompt
    isResult: true
```

As you develop full-stack applications, you must adhere to the following guidelines when writing code so that it is compatible with our development practices and cloud infrastructure.

### Tooling standards

Our organization uses `graphai` as our standard LLM orchestration package, `vite` as our development environment for frontend assets, and `yarn` as our package manager.

The following `package.json` should be used as a starting point for project dependencies. Note the use of `vite`, `rollup`, and `React`, as well as the GraphAI imports.

```json
{
	"name": "<INSERT NAME HERE>",
	"private": true,
	"version": "0.1.0",
	"type": "module",
	"scripts": {
		"dev": "vite",
		"build": "vite build",
		"lint": "eslint src",
		"lint-fix": "eslint src --ext js,jsx,ts,tsx --report-unused-disable-directives --fix",
		"tsc-watch": "npx tsc -noEmit --watch",
		"preview": "vite preview",
		"test": "vitest"
	},
	"dependencies": {
		"@graphai/agent_filters": "^2.0.0",
		"@graphai/http_client_agent_filter": "^2.0.1",
		"@graphai/llm_agents": "^2.0.1",
		"@graphai/service_agents": "^2.0.1",
		"@graphai/stream_agent_filter": "^2.0.2",
		"@graphai/vanilla": "^2.0.4",
		"@tne/tne-agent-v2": "file:../packages/tne-tne-agent-v2-0.0.1.j.tgz",
		"graphai": "^2.0.5",
		"react": "^19.1.0",
		"react-dom": "^19.1.0",
		"react-markdown": "^10.1.0",
		"react-router-dom": "^7.6.2",
		"typescript": "^4.9.5",
		"yaml": "^2.8.0",
		"zustand": "^5.0.5"
	},
	"devDependencies": {
		"@rollup/plugin-alias": "^5.1.1",
		"@rollup/plugin-commonjs": "^28.0.2",
		"@rollup/plugin-json": "^6.0.0",
		"@rollup/plugin-node-resolve": "^16.0.0",
		"@rollup/plugin-sucrase": "^5.0.2",
		"@rollup/plugin-typescript": "^12.1.2",
		"@testing-library/dom": "^10.4.0",
		"@testing-library/jest-dom": "^6.6.3",
		"@testing-library/react": "^16.3.0",
		"@testing-library/user-event": "^13.5.0",
		"@types/jest": "^27.5.2",
		"@types/node": "^16.18.126",
		"@types/react": "^19.1.6",
		"@types/react-dom": "^19.1.6",
		"@vitejs/plugin-react": "^4.2.1",
		"eslint": "^8.57.0",
		"eslint-plugin-react-hooks": "^4.6.0",
		"eslint-plugin-react-refresh": "^0.4.5",
		"postcss": "^8.5.1",
		"rollup": "^3.25.0",
		"rollup-plugin-postcss": "^4.0.0",
		"vite": "^5.1.4",
		"vite-plugin-checker": "^0.6.4",
		"vitest": "^1.3.1"
	},
	"browserslist": {
		"production": [">0.2%", "not dead", "not op_mini all"],
		"development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
	}
}
```

The following `vite.config.js` should be used as a starting point.

```javascript
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import checker from "vite-plugin-checker"
import { resolve } from "path"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), "")

	return {
		base: "/",
		build: {
			outDir: "dist",
			assetsDir: "assets",
			commonjsOptions: { transformMixedEsModules: true },
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ["react", "react-dom"],
						graphai: ["graphai", "@graphai/vanilla", "@graphai/llm_agents"],
						// Only include packages that are actually installed:
						// mui: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
						// charts: ['recharts'],
					},
				},
			},
		},
		plugins: [
			react(),
			checker({
				typescript: true,
				eslint: {
					lintCommand: "eslint",
				},
			}),
		],
		define: {
			global: "globalThis",
		},
		resolve: {
			alias: {
				"@": resolve(__dirname, "src"),
				async_hooks: "async_hooks-browserify",
			},
		},
		optimizeDeps: {
			exclude: ["@graphai/agent_filters"],
		},
	}
})
```

You'll also need a `src/vite-env.d.ts` file:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_SERVER_AGENTS?: string;
  readonly VITE_GRAPHAI_SERVER_URL?: string;
  readonly VITE_OPENAI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
```

The following `rollup.config.js` should be used as a starting point.

```javascript
import path from "path"
import { fileURLToPath } from "url"
import alias from "@rollup/plugin-alias"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import postcss from "rollup-plugin-postcss"
import json from "@rollup/plugin-json"
import sucrase from "@rollup/plugin-sucrase"

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
	input: "src/main.tsx",
	output: {
		dir: "dist",
		format: "iife", // Use 'iife' for a self-executing function suitable for browsers
		name: "<INSERT NAME HERE>", // Name of the global variable for your app
		sourcemap: true,
	},
	plugins: [
		alias({
			entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
		}),
		resolve({
			browser: true, // Ensure resolution of browser-compatible modules
			preferBuiltins: false, // Disable Node.js built-ins
		}),
		commonjs({
			include: /node_modules/, // Include all dependencies in node_modules
			requireReturnsDefault: "auto", // Attempt to automatically handle default exports
		}),
		json(),
		postcss({
			extensions: [".css"],
		}),
		sucrase({
			exclude: ["node_modules/**", "**/*.css", "**/*.json"],
			transforms: ["typescript", "jsx"],
		}),
	],
	context: "window",
	watch: {
		chunkSizeWarningLimit: 1000,
	},
}
```

The following `tsconfig.json` should be used as a starting point.

```json
{
	"compilerOptions": {
		"target": "ES2020",
		"useDefineForClassFields": true,
		"lib": ["ES2020", "DOM", "DOM.Iterable"],
		"module": "ES2020",
		"skipLibCheck": true,

		/* Bundler mode */
		"moduleResolution": "Node",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"jsx": "react-jsx",
		"baseUrl": "src",
		"paths": {
			"@/*": ["./*"]
		},

		/* Linting */
		"strict": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noFallthroughCasesInSwitch": true,

		/* Additional options for compatibility */
		"allowSyntheticDefaultImports": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true
	},
	"include": ["src"],
	"exclude": ["node_modules"],
	"references": [{ "path": "./tsconfig.node.json" }]
}
```

The following `tsconfig.node.json` should be used as a starting point.

```json
{
	"compilerOptions": {
		"composite": true,
		"skipLibCheck": true,
		"module": "ES2020",
		"moduleResolution": "Node",
		"allowSyntheticDefaultImports": true,
		"allowJs": true
	},
	"include": ["vite.config.*", "*.config.*"],
	"exclude": ["node_modules", "dist"]
}
```

## GraphAI Integration

This section demonstrates how to integrate GraphAI into a TypeScript application with environment-aware configuration. The service automatically adapts between local development and production environments using the environment variable management system.

### Important: React Import Configuration

When using React 17+ with the new JSX transform, you should **NOT** import React directly in your components. Instead:

**❌ Don't do this:**

```typescript
import React, { useState } from "react"
```

**✅ Do this instead:**

```typescript
import { useState } from "react"
```

**For main.tsx, use StrictMode directly:**

```typescript
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### Vite Environment Types

Create a `src/vite-env.d.ts` file to properly configure TypeScript for Vite and React:

```typescript
/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
	readonly MODE: string
	readonly BASE_URL: string
	readonly PROD: boolean
	readonly DEV: boolean
	readonly VITE_USE_SERVER_AGENTS?: string
	readonly VITE_GRAPHAI_SERVER_URL?: string
	readonly VITE_OPENAI_API_KEY?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
```

### GraphAI Service Implementation

```typescript
import { streamAgentFilterGenerator } from "@graphai/stream_agent_filter"
import { httpAgentFilter } from "@graphai/http_client_agent_filter"
import { GraphAI, AgentFunctionContext } from "graphai"
import { openAIAgent } from "@graphai/llm_agents"
import * as agents from "@graphai/vanilla"
import { fetchAgent } from "@graphai/service_agents"
import * as YAML from "yaml"
import { getAppConfig, AppConfig } from "../config/environment"

// Define interfaces for your data and responses
interface DataItem {
	id: string
	name: string
	category: string
	metadata: Record<string, any>
}

interface GraphAIResponse {
	success: boolean
	result?: string
	error?: string
}

class GraphAIService {
	private allAgents: any
	private config: any
	private workflow: any
	private appConfig: AppConfig

	constructor() {
		// Load environment configuration
		this.appConfig = getAppConfig()

		// Create comprehensive agent collection
		// Only include openAIAgent for local development
		this.allAgents = {
			...agents,
			fetchAgent,
			openAIAgent,
		}

		// Create configuration for agents
		// Only configure openAI for local development
		this.config = this.appConfig.useServerAgents
			? {
					openAIAgent: {
						stream: true,
					},
				}
			: {
					openAIAgent: {
						forWeb: true,
						apiKey: this.appConfig.openaiApiKey,
						stream: true,
					},
				}

		// Load the workflow
		this.loadWorkflow()
	}

	/**
	 * Load the GraphAI workflow from YAML file
	 */
	private async loadWorkflow(): Promise<void> {
		try {
			const response = await fetch("/your-workflow.yaml")
			const workflowContent = await response.text()
			this.workflow = YAML.parse(workflowContent)
		} catch (error) {
			console.error("Failed to load workflow:", error)
		}
	}

	/**
	 * Format structured data for GraphAI workflows
	 * This demonstrates how to prepare any type of data for injection
	 */
	private formatDataCollection(items: DataItem[]): string {
		return items
			.map((item) => {
				return `
Item: ${item.name} (ID: ${item.id})
Category: ${item.category}
Metadata: ${JSON.stringify(item.metadata, null, 2)}
---`
			})
			.join("\n")
	}

	/**
	 * Execute workflow with environment-aware configuration
	 */
	async executeGraphAI(
		query: string,
		data: DataItem[],
		onStream: (response: string) => void,
	): Promise<GraphAIResponse> {
		try {
			// Ensure workflow is loaded
			if (!this.workflow) {
				await this.loadWorkflow()
			}

			let lastNodeId: string | null = null
			const streamCallback = (context: AgentFunctionContext, token: string) => {
				console.log(token)
				if (context.debugInfo.nodeId !== lastNodeId && lastNodeId !== null) {
					onStream("\n\n")
				}
				lastNodeId = context.debugInfo.nodeId
				onStream(token)
			}

			// Agent filters for processing
			const streamAgentFilter = streamAgentFilterGenerator<string>(streamCallback)

			// Configure server agents based on environment
			const serverAgents: string[] = this.appConfig.useServerAgents ? ["openAIAgent"] : []

			const agentFilters = [
				{
					name: "streamAgentFilter",
					agent: streamAgentFilter,
				},
				{
					name: "httpAgentFilter",
					agent: httpAgentFilter,
					filterParams: {
						server: {
							baseUrl: this.appConfig.graphaiServerUrl,
						},
					},
					agentIds: serverAgents,
				},
			]

			// Format your data for injection
			const dataCollectionText = this.formatDataCollection(data)

			const graphai = new GraphAI(this.workflow, this.allAgents, {
				agentFilters: agentFilters,
				config: this.config,
			})

			// Inject values
			graphai.injectValue("userPrompt", query)
			graphai.injectValue("dataCollection", dataCollectionText)

			/*
         CRITICAL: Use injectValue() to pass data into
         your workflow. This allows you to inject any type of data:
         structured data, images, files, etc.

         You can inject multiple types of data:
         graphai.injectValue("imageData", base64ImageString);
         graphai.injectValue("fileContent", fileContentString);
         graphai.injectValue("contextData", JSON.stringify(contextObject));

         Note that the static node type must match the injected data.
         To inject an array object, the static node must look like:

            nodeName:
              value: []
      */

			// Logging with environment context
			graphai.onLogCallback = ({ nodeId, agentId, state, errorMessage: errorMessage }) => {
				if (!errorMessage) {
					console.log(
						`${nodeId} ${agentId} ${state} (${this.appConfig.useServerAgents ? "server" : "local"})`,
					)
				} else {
					console.log(`ERROR: ${nodeId} ${agentId} ${state}: ${errorMessage}`)
				}
			}

			const result = await graphai.run()

			return {
				success: true,
				result: this.formatGraphAIResult(result),
			}
		} catch (error) {
			console.error("GraphAI error:", error)
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			}
		}
	}

	/**
	 * Format GraphAI result for display
	 */
	private formatGraphAIResult(result: any): string {
		if (result && typeof result === "object") {
			const resultKeys = Object.keys(result)
			if (resultKeys.length > 0) {
				// Return the first result node's content
				const firstKey = resultKeys[0]
				const firstResult = result[firstKey]

				if (typeof firstResult === "string") {
					return firstResult
				} else if (firstResult && firstResult.text) {
					return firstResult.text
				} else {
					return JSON.stringify(firstResult, null, 2)
				}
			}
		}

		return typeof result === "string" ? result : JSON.stringify(result, null, 2)
	}

	/**
	 * Get current configuration info for debugging
	 */
	getConfigInfo(): { environment: string; useServerAgents: boolean; serverUrl: string } {
		return {
			environment: this.appConfig.isProduction ? "production" : "development",
			useServerAgents: this.appConfig.useServerAgents,
			serverUrl: this.appConfig.graphaiServerUrl,
		}
	}
}

const graphAIServiceInstance = new GraphAIService()
export default graphAIServiceInstance
```

## Using the GraphAI Service in React

Here's a minimal example showing how to import and use the GraphAI service in a React component:

```typescript
import { useState, useCallback } from 'react';
import graphaiService, { GraphAIResponse } from '../services/graphaiService';

const AIComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Your application data
  const data: DataItem[] = []; // Replace with your actual data

  const handleQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;

    // Clear previous state before starting new query
    setError('');
    setResponse('');
    setIsLoading(true);

    try {
      // Track if we've received the first token to improve UX
      let hasReceivedFirstToken = false;

      // Stream callback for real-time updates
      const onStream = (token: string) => {
        // Stop loading spinner as soon as first token arrives for better UX
        // This allows users to see content appearing immediately
        if (!hasReceivedFirstToken) {
          hasReceivedFirstToken = true;
          setIsLoading(false);
        }

        setResponse(prev => prev + token);
      };

      // Execute GraphAI workflow
      const result: GraphAIResponse = await graphaiService.executeGraphAI(
        query,
        data,
        onStream
      );

      if (result.success && result.result) {
        // Ensure final complete response is displayed
        // This handles cases where streaming doesn't work or is incomplete
        setResponse(result.result);
      } else if (!result.success && result.error) {
        setError(result.error);
        setResponse('');
      }
    } catch (error) {
      console.error('GraphAI error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setResponse('');
    } finally {
      // Always stop loading at the end as a safety net
      setIsLoading(false);
    }
  }, [data]);

  return (
    <div>
      <input
        type="text"
        onKeyPress={(e) => e.key === 'Enter' && handleQuery(e.currentTarget.value)}
        placeholder="Ask anything..."
      />
      <button onClick={() => handleQuery('Your query here')}>
        Ask AI
      </button>

      {isLoading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {response && (
        <div>
          {response}
          {isLoading && <span>|</span>} {/* Show cursor while streaming */}
        </div>
      )}
    </div>
  );
};
```

## Environment Variable Management

### Overview

The GraphAI application uses a sophisticated environment variable management system that adapts between local development and production deployment environments. Environment variables control how GraphAI agents are configured and whether they run locally or on remote servers.

### Environment Configuration Structure

#### Key Environment Variables

- **`VITE_USE_SERVER_AGENTS`**: Controls whether to use server-side GraphAI agents or local agents
- **`VITE_GRAPHAI_SERVER_URL`**: URL endpoint for the GraphAI server when using server agents
- **`VITE_OPENAI_API_KEY`**: OpenAI API key for local development (only used when not using server agents)

#### Environment Detection Logic

```typescript
const isProduction = import.meta.env.PROD
const useServerAgents = import.meta.env.VITE_USE_SERVER_AGENTS === "true" || isProduction

const config = {
	isProduction,
	useServerAgents,
	graphaiServerUrl: import.meta.env.VITE_GRAPHAI_SERVER_URL || "http://localhost:8085/agents",
	openaiApiKey: useServerAgents ? undefined : import.meta.env.VITE_OPENAI_API_KEY,
}
```

### GraphAI Service Integration

This component automatically adapts its configuration based on environment variables:

#### Agent Configuration

```typescript
// Agent collection - same for all environments
this.allAgents = {
	...agents,
	fetchAgent,
	openAIAgent,
}

// Configuration adapts based on environment
this.config = this.appConfig.useServerAgents
	? {
			openAIAgent: {
				stream: true,
			},
		}
	: {
			openAIAgent: {
				forWeb: true,
				apiKey: this.appConfig.openaiApiKey,
				stream: true,
			},
		}
```

#### Server Agent Filtering

When using server agents, the service configures HTTP agent filters to route specific agents to the remote server:

```typescript
// Configure server agents based on environment
const serverAgents: string[] = this.appConfig.useServerAgents ? ["openAIAgent"] : []

const agentFilters = [
	{
		name: "streamAgentFilter",
		agent: streamAgentFilter,
	},
	{
		name: "httpAgentFilter",
		agent: httpAgentFilter,
		filterParams: {
			server: {
				baseUrl: this.appConfig.graphaiServerUrl,
			},
		},
		agentIds: serverAgents,
	},
]
```

### Environment Files

The application supports different environment configurations:

- **Development**: Uses local OpenAI API key, agents run in browser
- **Production**: Uses server agents, no API key needed in browser

#### Vite Configuration

The [`vite.config.js`](wine-cellar-app/vite.config.js) automatically loads environment variables:

```javascript
export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), "")
	// Environment variables are automatically available as import.meta.env.*
})
```

### Debugging Environment Variables

The environment configuration includes comprehensive logging for debugging:

```typescript
console.log("=== Environment Variables Debug ===")
console.log("import.meta.env.PROD:", import.meta.env.PROD)
console.log("import.meta.env.DEV:", import.meta.env.DEV)
console.log("import.meta.env.MODE:", import.meta.env.MODE)
console.log("import.meta.env.VITE_USE_SERVER_AGENTS:", import.meta.env.VITE_USE_SERVER_AGENTS)
console.log("import.meta.env.VITE_GRAPHAI_SERVER_URL:", import.meta.env.VITE_GRAPHAI_SERVER_URL)
console.log("===================================")
```

Use the following defaults for your server configuration (both `dev` and `prod` deployments).

```shell
# Development/staging environment
# Use server-side GraphAI processing
VITE_USE_SERVER_AGENTS=true
VITE_GRAPHAI_SERVER_URL=https://graphai.dev.tne.ai/agents
```

## Deployment with tne-ci-mcp Server

### Overview

Deployment is handled through the **tne-ci-mcp** MCP server, which provides automated deployment tools for AWS S3 and Kubernetes. If not available, alert the user that it must be installed [here](https://github.com/tne-ai/tne-ci-mcp).

### Available MCP Tools

The tne-ci-mcp server provides three main deployment tools:

#### 1. deploy-app

Deploys the application to AWS S3 and sets up Kubernetes routing.

#### 2. cleanup-app

Removes all deployed resources from AWS and Kubernetes.

#### 3. check-deployment-status

Checks the current deployment status across environments.

### Deployment Architecture

#### Domain Structure

- **Development**: `{app-name}.dev.tne.ai`
- **Production**: `{app-name}.tne.ai`

#### Infrastructure Components

- **S3 Bucket**: Static website hosting with public read access
- **VirtualService**: Routes custom domain to S3 website endpoint
- **ServiceEntry**: Allows Istio to route to external S3 endpoint
- **Shared Ingress Gateway**: Handles SSL termination and routing

### Environment-Specific Deployment

The MCP deployment tools automatically handle environment-specific configurations:

#### Development Deployment

```typescript
await use_mcp_tool("tne-ci", "deploy-app", {
	projectPath: "./wine-cellar-app",
	environment: "dev",
})
```

This creates:

- S3 bucket: `wine-cellar-dev`
- Domain: `wine-cellar.dev.tne.ai`
- VirtualService: `wine-cellar-dev` in `dev` namespace

#### Production Deployment

```typescript
await use_mcp_tool("tne-ci", "deploy-app", {
	projectPath: "./wine-cellar-app",
	environment: "prod",
})
```

This creates:

- S3 bucket: `wine-cellar-prod`
- Domain: `wine-cellar.tne.ai`
- VirtualService: `wine-cellar-prod` in `prod` namespace

### Prerequisites

Before using the MCP deployment tools, ensure:

1. **AWS CLI** configured with appropriate permissions
2. **kubectl** connected to your Kubernetes cluster
3. **Node.js & npm** for building the application
4. **tne-ci-mcp server** connected and available

#### Common Issues

1. **MCP Server Connection**: Ensure tne-ci-mcp server is running and connected
2. **AWS Permissions**: Verify AWS CLI has S3, CloudFront, and Route 53 permissions
3. **Kubernetes Access**: Check kubectl connection and namespace permissions
4. **Build Failures**: Ensure Node.js dependencies are installed and environment variables are set
