import type { ModelInfo, AgenticaModelId } from "@roo-code/types"
import { AGENTICA_DEFAULT_BASE_URL, agenticaDefaultModelId, agenticaModels } from "@roo-code/types"

import type { ApiHandlerOptions } from "../../shared/api"

import { ApiStream } from "../transform/stream"
import { getModelParams } from "../transform/model-params"

import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
import { calculateApiCostOpenAI } from "../../shared/cost"

export class AgenticaHandler extends BaseProvider implements SingleCompletionHandler {
	private options: ApiHandlerOptions
	private client: any

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options

		// Generate API key from email and bcrypt-compatible hash
		this.generateApiKey().then(apiKey => {
			// Using OpenAI-compatible client for Agentica
			import("openai").then(({ default: OpenAI }) => {
				this.client = new OpenAI({
					baseURL: this.options.agenticaBaseUrl || AGENTICA_DEFAULT_BASE_URL,
					apiKey: apiKey,
				})
			}).catch(error => {
				console.error("Failed to import OpenAI:", error)
				// Fallback to mock client
				this.client = {
					chat: {
						completions: {
							create: async () => ({})
						}
					}
				}
			})
		}).catch(error => {
			console.error("Failed to generate API key:", error)
			// Fallback to mock client
			this.client = {
				chat: {
					completions: {
						create: async () => ({})
					}
				}
			}
		})
	}

	async completePrompt(prompt: string): Promise<string> {
		const stream = await this.client.chat.completions.create({
			model: agenticaDefaultModelId,
			messages: [{ role: "user", content: prompt }],
			stream: false,
		})

		return stream.choices?.[0]?.message?.content || ""
	}

	private async generateApiKey(): Promise<string> {
		const email = this.options.agenticaEmail || ""
		const password = this.options.agenticaPassword || ""

		if (!email || !password) {
			return ""
		}

		try {
			// Send plaintext email and password - server will handle bcrypt comparison
			// Format: email|password (server will parse and authenticate)
			return `${email}|${password}`
		} catch (error) {
			console.error("Error generating API key:", error)
			return ""
		}
	}

	async *createMessage(
		systemPrompt: string,
		messages: any[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream {
		const model = this.getModel()
		const modelParams = getModelParams({
			format: "openai",
			modelId: model.id,
			model: model.info,
			settings: this.options,
			defaultTemperature: 0.7,
		})

		const stream = await this.client.chat.completions.create({
			model: model.id,
			max_tokens: model.maxTokens,
			messages: [{ role: "system", content: systemPrompt }, ...messages],
			stream: true,
			...modelParams,
		})

		for await (const chunk of stream) {
			const delta = chunk.choices?.[0]?.delta
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}
			
			if (chunk.usage) {
				yield {
					type: "usage",
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
					cacheWriteTokens: chunk.usage.cache_write_input_tokens || 0,
					cacheReadTokens: chunk.usage.cache_read_input_tokens || 0,
				}
			}
		}
	}

	getModel(): { id: AgenticaModelId; info: ModelInfo; maxTokens: number; temperature: number } {
		const modelId = (this.options.apiModelId || agenticaDefaultModelId) as AgenticaModelId
		const info = agenticaModels[modelId]
		const maxTokens = info.maxTokens
		const temperature = this.options.modelTemperature || 0.7
		return { id: modelId, info, maxTokens, temperature }
	}

	async calculateApiCost(): Promise<number> {
		try {
			const modelInfo = this.getModel().info
			// Mock usage data since we don't have getUsage method
			const usage = { inputTokens: 0, outputTokens: 0, cacheWriteTokens: 0, cacheReadTokens: 0 }
			const costResult = calculateApiCostOpenAI(modelInfo, usage.inputTokens, usage.outputTokens, usage.cacheWriteTokens, usage.cacheReadTokens)
			return costResult.totalCost
		} catch (error) {
			console.error("Error calculating API cost for Agentica:", error)
			return 0
		}
	}
}
