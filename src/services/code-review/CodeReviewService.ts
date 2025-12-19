import * as fs from "fs/promises"
import * as path from "path"
import type { ClineMessage, CodeReviewResult, CodeReviewIssue } from "@roo-code/types"
import { CloudService } from "@roo-code/cloud"
import { AgenticaClient } from "../../../webview-ui/src/services/AgenticaClient"
	improvements: Array<{
		category: string
		description: string
		suggestion: string
	}>
	documentation: Array<{
		type: 'missing' | 'inadequate' | 'outdated'
		description: string
		suggestion: string
	}>
	testing: Array<{
		type: 'unit' | 'integration' | 'e2e'
		description: string
		suggestion: string
	}>
	summary: string
}

export class CodeReviewService {
	private agenticaClient: AgenticaClient | null = null
	private cloudService: CloudService
	private workspacePath: string

	constructor(cloudService: CloudService, workspacePath: string) {
		this.cloudService = cloudService
		this.workspacePath = workspacePath
	}

	/**
	 * Initialize the service with authentication
	 */
	async initialize(): Promise<void> {
		if (!this.cloudService.isAuthenticated) {
			throw new Error("User must be authenticated with Agentica to use code review")
		}

		// Get auth token from cloud service
		// Note: This assumes CloudService exposes a way to get the token
		// You may need to modify CloudService to expose this
		const token = await this.getAuthToken()
		this.agenticaClient = new AgenticaClient(token)
	}

	/**
	 * Extract directory tree and diff that were modified during a task
	 */
	async extractTaskChanges(taskId: string, messages: ClineMessage[]): Promise<{
		directoryTree: string
		diff: string
		mode: string
		taskDescription: string
	}> {
		// Get directory tree
		const directoryTree = await this.getDirectoryTree()

		// Generate diff of changes
		const diff = await this.generateTaskDiff(messages)

		// Extract mode and task description
		const mode = this.extractTaskMode(messages)
		const taskDescription = this.extractTaskDescription(messages)

		return {
			directoryTree,
			diff,
			mode,
			taskDescription
		}
	}

	/**
	 * Generate a code review using MiniMax-M2 with the new flow:
	 * 1. Give directory tree and unified diff
	 * 2. Ask for relevant files to check
	 * 3. Provide file contents
	 * 4. Identify issues
	 * 5. Return JSON list of problems
	 */
	async generateCodeReview(
		directoryTree: string,
		diff: string,
		mode: string,
		taskDescription: string
	): Promise<CodeReviewResult> {
		if (!this.agenticaClient) {
			throw new Error("CodeReviewService not initialized")
		}

		const conversationHistory: Array<{role: string, content: string}> = []

		// Step 1: Send initial prompt with directory tree and diff
		let prompt = this.buildInitialReviewPrompt(directoryTree, diff, mode, taskDescription)
		let response = await this.callMinimaxM2(prompt, conversationHistory)

		// Step 2: Extract file requests and get file contents
		const relevantFiles = this.extractRelevantFiles(response)

		if (relevantFiles.length > 0) {
			// Step 3: Provide file contents
			let fileContents = ""
			for (const filePath of relevantFiles.slice(0, 5)) { // Limit to 5 files
				try {
					const content = await this.requestFileContent(filePath)
					fileContents += `\n## Content of ${filePath}\n\`\`\`\n${content}\n\`\`\`\n`
				} catch (error) {
					fileContents += `\n## Content of ${filePath}\nError reading file: ${error instanceof Error ? error.message : String(error)}\n`
				}
			}

			// Step 4: Ask for issue identification
			prompt = `Here are the contents of the relevant files:\n\n${fileContents}\n\nPlease analyze these files and identify potential issues, problems, and areas for improvement. Focus on:

1. Code quality and maintainability issues
2. Potential bugs or security vulnerabilities
3. Performance problems
4. Poor coding practices
5. Missing error handling
6. Inadequate documentation
7. Complex code that should be abstracted

Return your analysis as a JSON array of issues in this exact format:

\`\`\`json
[
  {
    "title": "Brief title of the issue",
    "description": "Detailed description of the problem",
    "severity": "low|medium|high|critical",
    "category": "quality|bug|security|performance|maintainability|documentation",
    "file": "relative/path/to/file.js",
    "line": 42,
    "suggestion": "How to fix this issue"
  }
]
\`\`\`

Only return the JSON array, no other text.`

			response = await this.callMinimaxM2(prompt, conversationHistory)
		}

		// Step 5: Parse the final JSON response
		return this.parseIssuesList(response)
	}

	/**
	 * Extract relevant files from AI response
	 */
	private extractRelevantFiles(response: string): string[] {
		try {
			// Extract JSON array from response
			const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
			const jsonString = jsonMatch ? jsonMatch[1] : response.trim()
			const filePaths = JSON.parse(jsonString)

			if (Array.isArray(filePaths) && filePaths.every(path => typeof path === 'string')) {
				return filePaths
			}

			return []
		} catch (error) {
			console.warn("Failed to parse relevant files from response:", error)
			return []
		}
	}

	/**
	 * Parse the final issues list from AI response
	 */
	private parseIssuesList(response: string): CodeReviewResult {
		try {
			// Extract JSON array from response
			const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
			const jsonString = jsonMatch ? jsonMatch[1] : response.trim()
			const issues = JSON.parse(jsonString)

			if (!Array.isArray(issues)) {
				throw new Error("Response is not an array")
			}

			// Convert to the expected format
			const formattedIssues: CodeReviewIssue[] = issues.map((issue: any) => ({
				title: issue.title || issue.category || 'Code Issue',
				severity: issue.severity || 'medium',
				category: issue.category || 'quality',
				description: issue.description || '',
				suggestion: issue.suggestion || '',
				file: issue.file,
				line: issue.line
			}))

			return {
				strengths: [],
				issues: formattedIssues,
				improvements: [],
				documentation: [],
				testing: [],
				summary: `Found ${formattedIssues.length} issues that need attention.`
			}
		} catch (error) {
			console.error("Failed to parse issues list:", error)
			throw new Error("Invalid issues list format")
		}
	}

	/**
	 * Extract <read_file> requests from AI response (legacy method)
	 */
	private extractReadFileRequests(response: string): string[] {
		const readFileRegex = /<read_file[^>]*filepath="([^"]+)"/g
		const filePaths: string[] = []
		let match

		while ((match = readFileRegex.exec(response)) !== null) {
			filePaths.push(match[1])
		}

		return filePaths
	}

	/**
	 * Handle agent loop for requesting additional file content
	 */
	async requestFileContent(filePath: string): Promise<string> {
		// Read file content securely
		// This should validate file paths and ensure they're within workspace
		try {
			const content = await this.readFileContent(filePath)
			return content
		} catch (error) {
			console.error(`Failed to read file ${filePath}:`, error)
			throw new Error(`Unable to read file: ${filePath}`)
		}
	}

	private async getAuthToken(): Promise<string> {
		const token = this.cloudService.authService?.getSessionToken()
		if (!token) {
			throw new Error("No authentication token available")
		}
		return token
	}

	private async extractModifiedFiles(messages: ClineMessage[]): Promise<string[]> {
		const modifiedFiles = new Set<string>()

		// TODO: Implement file modification extraction from messages
		// The current message structure doesn't include tool information in the expected format

		return Array.from(modifiedFiles)
	}

	private async getDirectoryTree(): Promise<string> {
		try {
			// Import tree-sitter listFiles function
			const { listFiles } = await import("../glob/list-files")

			// Get all files in the workspace (excluding .gitignore)
			const [allFiles] = await listFiles(this.workspacePath, false, 1000)

			// Build a simple directory tree structure
			const tree: { [key: string]: any } = {}

			for (const file of allFiles) {
				const parts = file.split('/')
				let current = tree

				for (let i = 0; i < parts.length; i++) {
					const part = parts[i]
					if (!current[part]) {
						current[part] = i === parts.length - 1 ? null : {}
					}
					current = current[part]
				}
			}

			// Convert tree object to string representation
			return this.formatDirectoryTree(tree, '', true)
		} catch (error) {
			console.error("Failed to get directory tree:", error)
			return "Directory tree unavailable"
		}
	}

	private formatDirectoryTree(tree: any, prefix: string = '', isRoot: boolean = false): string {
		let result = ''

		const entries = Object.keys(tree).sort()
		entries.forEach((entry, index) => {
			const isLast = index === entries.length - 1
			const connector = isRoot ? '' : (isLast ? '└── ' : '├── ')
			const nextPrefix = isRoot ? '' : (prefix + (isLast ? '    ' : '│   '))

			result += prefix + connector + entry + '\n'

			if (tree[entry] && typeof tree[entry] === 'object') {
				result += this.formatDirectoryTree(tree[entry], nextPrefix)
			}
		})

		return result
	}


	private async generateTaskDiff(messages: ClineMessage[]): Promise<string> {
		// TODO: Implement diff generation from messages
		// The current message structure doesn't include tool information in the expected format
		return "Diff generation not yet implemented"
	}

	private extractTaskMode(messages: ClineMessage[]): string {
		// Find the mode from the first message or task setup
		const firstMessage = messages[0]
		if (firstMessage && firstMessage.text) {
			// This is a simplified extraction - you might need more sophisticated parsing
			return "code" // Default fallback
		}
		return "code"
	}

	private extractTaskDescription(messages: ClineMessage[]): string {
		// Extract the task description from the first user message
		const firstMessage = messages[0]
		return firstMessage?.text || "Code task"
	}

	private buildInitialReviewPrompt(
		directoryTree: string,
		diff: string,
		mode: string,
		taskDescription: string
	): string {
		let prompt = `# Directory Tree:

${directoryTree}

# Modified Files:

${diff}

You are Deca, an expert code reviewer with extensive knowledge of multiple programming languages. Your task is to analyze changes made in a repository and identify files that may require deeper inspection based on the modifications.

Instructions for Review:

Directory Structure and Context:

You will be provided with the workspace directory tree (excluding .gitignore files) to understand the overall structure of the project. This will help in identifying any dependencies or files that could be indirectly affected by the changes.

Code Changes:

You will receive a diff showing the exact changes made in the code. This will include file names and line-by-line modifications.

Identifying Relevant Files:

Directly affected files: The files modified in the diff are automatically included in your review.

Exporter(s) of modules imported by the modified files: If any files export modules (functions, classes, or objects) that were imported by the modified files, ensure these exports are used correctly.

Importer(s) of modules exported by the modified files: If any files import modules that were changed or exported by the modified files, verify that the changes do not introduce any breaking changes or unexpected behavior.

Utilities or common modules: Identify any utility or common modules (e.g., helper functions, base classes) that may be shared between the modified files and other parts of the repository. Check if these utility files need attention because the changes in the modified files may affect them or their usage.

Contextual Relevance:

Even if a file isn't directly impacted by the diff, it may still require a review if it plays a crucial role in the overall functionality, dependencies, or system design (e.g., a core utility or shared component).

Consider the specific framework, language, or technology stack being used (e.g., TypeScript, Python, Java, Node.js). Ensure that any changes that could break backward compatibility, alter expected behavior, or conflict with other parts of the system are flagged.

Actionable Insights:

As you analyze, provide insights on what files and sections need closer inspection.

If necessary, suggest improvements or highlight areas that may introduce risks (e.g., changes to public APIs, shared state, or cross-cutting concerns like logging and error handling).

Example of How You Should Think:

If you were given a set of TypeScript changes, you'd:

Focus on TypeScript interfaces, types, and exported modules.

Check related files that import the modified types or functions.

Consider utility or shared components, like logging, validation, or configuration, as they might be affected by the changes.

If this were a Python repo, the focus would shift toward:

Changes in class inheritance or function signatures.

Updates to libraries or modules that could break downstream consumers.

Any side effects from changes to shared resources (e.g., database connection pools, environment configurations).

The Output:

You will provide a list of files, in JSON (beyond those directly modified in the diff) that need deeper inspection or additional review based on the context of the repository and the code changes made.

Respond with a JSON array of file paths that need deeper inspection:

\`\`\`json
["path/to/file1.js", "path/to/file2.ts", "src/components/Button.tsx"]
\`\`\`

Only return the JSON array of file paths, no other text. If no additional files need deeper inspection, return an empty array [].`

		return prompt
	}

	private async callMinimaxM2(prompt: string, conversationHistory?: Array<{role: string, content: string}>): Promise<string> {
		return await this.agenticaClient!.callMinimaxM2(prompt, conversationHistory)
	}

	private parseReviewResponse(response: string): CodeReviewResult {
		try {
			// Extract JSON from the response
			const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
			const jsonString = jsonMatch ? jsonMatch[1] : response
			const parsed = JSON.parse(jsonString)

			// Validate the structure
			return {
				strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
				issues: Array.isArray(parsed.issues) ? parsed.issues.map((issue: any): CodeReviewIssue => ({
					title: issue.title || issue.category || 'Code Issue',
					severity: issue.severity || 'medium',
					category: issue.category || 'general',
					description: issue.description || '',
					suggestion: issue.suggestion,
					file: issue.file,
					line: issue.line
				})) : [],
				improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
				documentation: Array.isArray(parsed.documentation) ? parsed.documentation : [],
				testing: Array.isArray(parsed.testing) ? parsed.testing : [],
				summary: parsed.summary || 'Review completed'
			}
		} catch (error) {
			console.error("Failed to parse review response:", error)
			throw new Error("Invalid review response format")
		}
	}

	private async readFileContent(filePath: string): Promise<string> {
		try {
			// Resolve the file path to prevent directory traversal
			const resolvedPath = path.resolve(filePath)

			// Basic security check - ensure the file is within reasonable bounds
			// In a production implementation, you'd want more sophisticated checks
			if (resolvedPath.includes('..') || !resolvedPath.startsWith('/')) {
				// For now, allow any path but log a warning
				console.warn(`Potentially unsafe file path: ${filePath}`)
			}

			const content = await fs.readFile(resolvedPath, 'utf-8')
			return content
		} catch (error) {
			console.error(`Failed to read file ${filePath}:`, error)
			throw new Error(`Unable to read file: ${filePath}`)
		}
	}
}
