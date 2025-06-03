import { ToolArgs } from "./types"

export function getRunGraphaiDescription(args: ToolArgs): string | undefined {
	return `## run_graphai
Description: Execute a GraphAI workflow file. This tool runs GraphAI YAML or JSON files using the graphai CLI command. GraphAI files define agent workflows with nodes and connections for AI-powered data processing pipelines. The tool validates the file format and structure before execution and provides helpful error messages for common GraphAI issues.
Parameters:
- path: (required) Path to the GraphAI YAML or JSON file to execute. The file must have a .yaml, .yml, or .json extension and contain a valid GraphAI workflow structure with an 'agents' or 'nodes' section.
- chatHistory: (optional) An array of OpenAI-style chat messages with roles and content. Supports JSON strings, structured arrays, and XML format. Will be injected into workflows that have a 'chatHistory' node.
- userPrompt: (optional) A string containing the user's prompt. Will be injected into workflows that have a 'userPrompt' node.
Usage:
<run_graphai>
<path>path/to/workflow.yaml</path>
</run_graphai>

Example: Running a GraphAI workflow
<run_graphai>
<path>./workflows/data-processing.yaml</path>
</run_graphai>

Example: Running a GraphAI workflow with chat history
<run_graphai>
<path>examples/chat-workflow.yaml</path>
<chatHistory>[{"role":"user","content":"Hello"},{"role":"assistant","content":"Hi there!"}]</chatHistory>
<userPrompt>What's the weather like?</userPrompt>
</run_graphai>

Example: Running a GraphAI workflow in a subdirectory
<run_graphai>
<path>examples/sample-workflow.json</path>
</run_graphai>`
}
