import fs from "fs/promises"
import * as path from "path"
import * as YAML from "yaml"
import { GraphAI } from "graphai"
import { httpAgentFilter, streamAgentFilterGenerator } from "@graphai/agent_filters"
import { openAIAgent } from "@graphai/llm_agents"
import * as agents from "@graphai/vanilla"
import { fetchAgent, wikipediaAgent } from "@graphai/service_agents"
import { s3FileAgent, s3FileWriteAgent } from "@tne/tne-agent-v2/lib/agents/browser"
import { codeGenerationTemplateAgent, pythonCodeAgent } from "@tne/tne-agent-v2/lib/agents/python/browser"
import { semanticAgent } from "@tne/tne-agent-v2/lib/agents/rag"

import { Task } from "../task/Task"
import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag, ToolResponse } from "../../shared/tools"
import { formatResponse } from "../prompts/responses"
import { unescapeHtmlEntities } from "../../utils/text-normalization"

/**
 * Validates if a file is a valid GraphAI file based on extension
 */
function isValidGraphAIFile(filePath: string): boolean {
	const ext = path.extname(filePath).toLowerCase()
	return [".yaml", ".yml", ".json"].includes(ext)
}

/**
 * Validates if the file content contains a valid GraphAI structure
 */
async function validateGraphAIContent(filePath: string): Promise<{ isValid: boolean; error?: string }> {
	try {
		const content = await fs.readFile(filePath, "utf8")
		let parsedContent: any

		const ext = path.extname(filePath).toLowerCase()
		if (ext === ".json") {
			parsedContent = JSON.parse(content)
		} else {
			parsedContent = YAML.parse(content)
		}

		// Check if it has the basic GraphAI structure
		if (!parsedContent || typeof parsedContent !== "object") {
			return { isValid: false, error: "File does not contain a valid YAML/JSON object" }
		}

		// Check for GraphAI-specific structure (agents or nodes)
		if (!parsedContent.agents && !parsedContent.nodes) {
			return {
				isValid: false,
				error: "File does not appear to be a GraphAI workflow (missing 'agents' or 'nodes' section)",
			}
		}

		return { isValid: true }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		return { isValid: false, error: `Failed to parse file: ${errorMessage}` }
	}
}

/**
 * Maps GraphAI execution errors to user-friendly messages
 */
function mapGraphAIError(error: Error): string {
	const message = error.message.toLowerCase()

	if (message.includes("agent") && message.includes("not found")) {
		return "Agent not found. Ensure all referenced agents are available in the loaded agent packages (vanilla, openAI, TNE agents, etc.)."
	}

	if (message.includes("circular")) {
		return "Circular dependency detected in workflow nodes."
	}

	if (message.includes("input") || message.includes("reference")) {
		return "Invalid input reference. Check node input syntax (:nodeId)."
	}

	if (message.includes("timeout")) {
		return "GraphAI workflow execution timed out. Check for infinite loops or long-running operations."
	}

	return `GraphAI execution error: ${error.message}`
}

/**
 * Formats GraphAI execution results for display
 */
function formatGraphAIResult(result: any, filePath: string): string {
	let output = `GraphAI workflow execution completed for: ${path.basename(filePath)}\n\n`

	if (result && typeof result === "object") {
		// Check if result has specific output nodes
		const resultKeys = Object.keys(result)
		if (resultKeys.length > 0) {
			output += `Results:\n`
			for (const key of resultKeys) {
				output += `  ${key}: ${JSON.stringify(result[key], null, 2)}\n`
			}
		} else {
			output += `Result: ${JSON.stringify(result, null, 2)}`
		}
	} else {
		output += `Result: ${result}`
	}

	return output
}

/**
 * Parses flexible input formats for chatHistory parameter
 */
function parseFlexibleFormat(input: string, paramName: string): any {
	// If input is already an object/array, return as-is
	if (typeof input === "object" && input !== null) {
		return input
	}

	// Try JSON parsing first
	try {
		const parsed = JSON.parse(input)
		return parsed
	} catch (jsonError) {
		// JSON parsing failed, try XML parsing
		try {
			return parseXMLMessages(input)
		} catch (xmlError) {
			// If both fail, throw a descriptive error
			throw new Error(
				`Invalid format for ${paramName}. Expected JSON array, XML format, or structured data. JSON error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
			)
		}
	}
}

/**
 * Parses XML format messages into OpenAI-style chat messages
 */
function parseXMLMessages(xmlString: string): any[] {
	// Simple XML parsing for message format
	// This is a basic implementation - could be enhanced with a proper XML parser
	const messages: any[] = []

	// Match message blocks in XML
	const messageRegex = /<message[^>]*role=["']([^"']+)["'][^>]*>(.*?)<\/message>/gs
	let match

	while ((match = messageRegex.exec(xmlString)) !== null) {
		const role = match[1]
		const content = match[2].trim()
		messages.push({ role, content })
	}

	if (messages.length === 0) {
		throw new Error("No valid message elements found in XML format")
	}

	return messages
}

export async function runGraphaiTool(
	cline: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	let filePath: string | undefined = block.params.path
	const chatHistoryParam: string | undefined = block.params.chatHistory
	const userPromptParam: string | undefined = block.params.userPrompt

	try {
		if (block.partial) {
			await cline.ask("command", removeClosingTag("path", filePath), block.partial).catch(() => {})
			return
		} else {
			if (!filePath) {
				cline.consecutiveMistakeCount++
				cline.recordToolError("run_graphai")
				pushToolResult(await cline.sayAndCreateMissingParamError("run_graphai", "path"))
				return
			}

			// Parse optional parameters
			let messages: any[] | undefined
			let userMessage: { content: string } | undefined

			if (chatHistoryParam) {
				try {
					messages = parseFlexibleFormat(chatHistoryParam, "chatHistory")
					// Validate that it's an array
					if (!Array.isArray(messages)) {
						throw new Error("chatHistory must be an array of message objects")
					}
				} catch (error) {
					cline.consecutiveMistakeCount++
					cline.recordToolError("run_graphai")
					pushToolResult(
						formatResponse.toolError(
							`Invalid chatHistory parameter: ${error instanceof Error ? error.message : String(error)}`,
						),
					)
					return
				}
			}

			if (userPromptParam) {
				userMessage = { content: userPromptParam }
			}

			// Validate file extension
			if (!isValidGraphAIFile(filePath)) {
				cline.consecutiveMistakeCount++
				cline.recordToolError("run_graphai")
				pushToolResult(
					formatResponse.toolError(
						"Invalid file type. GraphAI files must have .yaml, .yml, or .json extension.",
					),
				)
				return
			}

			// Resolve file path
			const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(cline.cwd, filePath)

			// Check if file exists
			try {
				await fs.access(resolvedPath)
			} catch {
				cline.consecutiveMistakeCount++
				cline.recordToolError("run_graphai")
				pushToolResult(formatResponse.toolError(`File not found: ${filePath}`))
				return
			}

			// Validate GraphAI content
			const validation = await validateGraphAIContent(resolvedPath)
			if (!validation.isValid) {
				cline.consecutiveMistakeCount++
				cline.recordToolError("run_graphai")
				pushToolResult(
					formatResponse.toolError(
						`Invalid GraphAI file: ${validation.error}\n\nGraphAI files should contain an 'agents' or 'nodes' section with workflow definitions.`,
					),
				)
				return
			}

			cline.consecutiveMistakeCount = 0

			filePath = unescapeHtmlEntities(filePath)

			const didApprove = await askApproval("command", `Run GraphAI workflow: ${path.basename(filePath)}`)

			if (!didApprove) {
				return
			}

			// Declare executionLogs at function scope to make it accessible in catch block
			const executionLogs: string[] = []

			try {
				// Load and parse the GraphAI workflow file
				const workflowContent = await fs.readFile(resolvedPath, "utf8")
				const ext = path.extname(resolvedPath).toLowerCase()

				let workflow: any
				if (ext === ".json") {
					workflow = JSON.parse(workflowContent)
				} else {
					workflow = YAML.parse(workflowContent)
				}

				// Create S3 credentials from environment variables
				const s3Credentials = {
					accessKeyId: process.env.AWS_ACCESS_KEY_ID,
					secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
				}

				// Create comprehensive agent collection
				const allAgents = {
					...agents,
					fetchAgent,
					wikipediaAgent,
					openAIAgent,
					s3FileAgent,
					s3FileWriteAgent,
					codeGenerationTemplateAgent,
					pythonCodeAgent,
					semanticAgent,
				}

				// Create configuration for agents
				const config = {
					global: { uid: "london-demo-1-13" },
					s3FileAgent: { credentials: s3Credentials },
					s3FileWriteAgent: { credentials: s3Credentials },
					codeGenerationTemplateAgent: { credentials: s3Credentials },
					openAIAgent: {
						apiKey: process.env.OPENAI_API_KEY,
						stream: false,
					},
				}

				// Create GraphAI instance with all available agents and configuration
				const graphai = new GraphAI(workflow, allAgents, { config: config })

				// Inject optional parameters if provided and corresponding nodes exist
				if (messages && graphai.nodes["chatHistory"]) {
					graphai.injectValue("chatHistory", messages)
				}
				if (userMessage && graphai.nodes["userPrompt"]) {
					graphai.injectValue("userPrompt", userMessage.content)
				}

				// Execute the workflow
				const result = await graphai.run()

				// Format and return the results with execution logs
				let formattedResult = formatGraphAIResult(result, filePath)

				if (executionLogs.length > 0) {
					formattedResult += "\n\n📋 GraphAI Execution Logs:\n"
					formattedResult += executionLogs.map((log) => `  ${log}`).join("\n")
				}

				pushToolResult(formattedResult)
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? mapGraphAIError(error) : String(error)

				let enhancedError = `Failed to execute GraphAI workflow: ${errorMessage}`

				// Add execution logs if available
				if (executionLogs.length > 0) {
					enhancedError += "\n\n📋 GraphAI Execution Logs:\n"
					enhancedError += executionLogs.map((log: string) => `  ${log}`).join("\n")
				}

				// Add full error details including stack trace
				if (error instanceof Error) {
					enhancedError += "\n\n🔍 Full Error Details:\n"
					enhancedError += `Error Name: ${error.name}\n`
					enhancedError += `Error Message: ${error.message}\n`
					if (error.stack) {
						enhancedError += `Stack Trace:\n${error.stack}\n`
					}

					// Add any additional error properties
					const errorObj = error as any
					const additionalProps = Object.keys(errorObj).filter(
						(key) => !["name", "message", "stack"].includes(key),
					)
					if (additionalProps.length > 0) {
						enhancedError += "\nAdditional Error Properties:\n"
						for (const prop of additionalProps) {
							enhancedError += `${prop}: ${JSON.stringify(errorObj[prop], null, 2)}\n`
						}
					}

					enhancedError += "\n💡 Common GraphAI issues:\n"
					enhancedError +=
						"- Check that all referenced agents are available in the loaded agent packages (vanilla, openAI, TNE agents, etc.)\n"
					enhancedError += "- Verify that input references use the correct syntax (:nodeId)\n"
					enhancedError += "- Ensure all required agent parameters are provided\n"
					enhancedError += "- Check for circular dependencies in the workflow\n"
					enhancedError += "- Validate the workflow structure matches GraphAI specifications"
				}

				pushToolResult(formatResponse.toolError(enhancedError))
			}

			return
		}
	} catch (error) {
		await handleError("running GraphAI workflow", error)
		return
	}
}
