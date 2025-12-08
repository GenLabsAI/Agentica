import type { ModelInfo, AgenticaModelId } from "@roo-code/types"
import { AGENTICA_DEFAULT_BASE_URL, agenticaDefaultModelId, agenticaModels } from "@roo-code/types"
import OpenAI from "openai"

import type { ApiHandlerOptions } from "../../shared/api"

import { ApiStream } from "../transform/stream"
import { getModelParams } from "../transform/model-params"

import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
import { calculateApiCostOpenAI } from "../../shared/cost"

export class AgenticaHandler extends BaseProvider implements SingleCompletionHandler {
	private options: ApiHandlerOptions
	private client: OpenAI

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options

		const apiKey = this.generateApiKey()
		this.client = new OpenAI({
			baseURL: this.options.agenticaBaseUrl || AGENTICA_DEFAULT_BASE_URL,
			apiKey: apiKey,
			defaultHeaders: {
				"HTTP-Referer": "https://agentica.com",
				"X-Title": "Agentica Extension"
			}
		})
	}

	async completePrompt(prompt: string): Promise<string> {
		try {
			const response = await this.client.chat.completions.create({
				model: agenticaDefaultModelId,
				messages: [{ role: "user", content: prompt }],
				stream: false,
			})

			return response.choices[0]?.message?.content || ""
		} catch (error) {
			console.error("Agentica completePrompt error:", error)
			throw error
		}
	}

	private generateApiKey(): string {
		const email = this.options.agenticaEmail || ""
		const password = this.options.agenticaPassword || ""

		if (!email || !password) {
			return "dummy-key"
		}

		// Send plaintext email and password - server will handle authentication
		return `${email}|${password}`
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

		try {
			const stream = await this.client.chat.completions.create({
				model: model.id,
				max_tokens: model.maxTokens,
				messages: [{ role: "system", content: systemPrompt }, ...messages],
				stream: true,
				...modelParams,
			}) as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>

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
		} catch (error: any) {
			console.error("Agentica createMessage error:", error)
			// Ensure we yield an error so the UI stops loading
			// Note: The UI layer usually handles exceptions from the generator, 
			// but we want to make sure it's propagated correctly.
			throw error
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
			const usage = { inputTokens: 0, outputTokens: 0, cacheWriteTokens: 0, cacheReadTokens: 0 }
			const costResult = calculateApiCostOpenAI(modelInfo, usage.inputTokens, usage.outputTokens, usage.cacheWriteTokens, usage.cacheReadTokens)
			return costResult.totalCost
		} catch (error) {
			console.error("Error calculating API cost for Agentica:", error)
			return 0
		}
	}
}
