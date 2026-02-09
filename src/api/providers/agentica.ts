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

	private usesResponsesApi(modelId: string): boolean {
		return modelId === "deca-2.5-pro-low" || modelId === "deca-2.5-pro-high"
	}

	private getResponsesApiBaseUrl(): string {
		const baseUrl = this.options.agenticaBaseUrl || AGENTICA_DEFAULT_BASE_URL
		return baseUrl.replace(/\/v1\/?$/, "/v1/responses")
	}

	async completePrompt(prompt: string): Promise<string> {
		const model = this.getModel()

		if (this.usesResponsesApi(model.id)) {
			return this.completePromptWithResponsesApi(prompt, model.id)
		}

		try {
			const response = await this.client.chat.completions.create({
				model: model.id,
				messages: [{ role: "user", content: prompt }],
				stream: false,
			})

			return response.choices[0]?.message?.content || ""
		} catch (error) {
			console.error("Agentica completePrompt error:", error)
			throw error
		}
	}

	private async completePromptWithResponsesApi(prompt: string, modelId: string): Promise<string> {
		try {
			const response = await fetch(this.getResponsesApiBaseUrl(), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.generateApiKey()}`,
					"HTTP-Referer": "https://agentica.com",
					"X-Title": "Agentica Extension"
				},
				body: JSON.stringify({
					model: modelId,
					input: prompt,
					stream: false,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`Responses API error: ${response.status} - ${errorText}`)
			}

			const data = await response.json()
			const outputItem = data.output?.find((item: any) => item.type === "message")
			const textContent = outputItem?.content?.find((c: any) => c.type === "output_text")
			return textContent?.text || ""
		} catch (error) {
			console.error("Agentica completePromptWithResponsesApi error:", error)
			throw error
		}
	}

	private generateApiKey(): string {
		// Prefer API key from GitHub OAuth if available
		if (this.options.agenticaApiKey) {
			return this.options.agenticaApiKey
		}

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

		if (this.usesResponsesApi(model.id)) {
			yield* this.createMessageWithResponsesApi(systemPrompt, messages, model)
			return
		}

		const modelParams = getModelParams({
			format: "openai",
			modelId: model.id,
			model: model.info,
			settings: this.options,
			defaultTemperature: 0.7,
		})

		try {
			const { tools, ...paramsWithoutTools } = modelParams
			const stream = await this.client.chat.completions.create({
				model: model.id,
				max_tokens: model.maxTokens,
				messages: [{ role: "system", content: systemPrompt }, ...messages],
				stream: true,
				...paramsWithoutTools,
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
						cacheWriteTokens: 0,
						cacheReadTokens: 0,
					}
				}
			}
		} catch (error: any) {
			console.error("Agentica createMessage error:", error)
			throw error
		}
	}

	private async *createMessageWithResponsesApi(
		systemPrompt: string,
		messages: any[],
		model: { id: AgenticaModelId; info: ModelInfo; maxTokens: number; temperature: number }
	): ApiStream {
		try {
			const inputMessages = messages.map((msg: any) => ({
				role: msg.role,
				content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
			}))

			const response = await fetch(this.getResponsesApiBaseUrl(), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.generateApiKey()}`,
					"HTTP-Referer": "https://agentica.com",
					"X-Title": "Agentica Extension"
				},
				body: JSON.stringify({
					model: model.id,
					instructions: systemPrompt,
					input: inputMessages,
					max_output_tokens: model.maxTokens,
					temperature: model.temperature,
					stream: true,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`Responses API error: ${response.status} - ${errorText}`)
			}

			if (!response.body) {
				throw new Error("No response body from Responses API")
			}

			const reader = response.body.getReader()
			const decoder = new TextDecoder()
			let buffer = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				buffer = lines.pop() || ""

				for (const line of lines) {
					if (!line.startsWith("data: ")) continue
					const data = line.slice(6).trim()
					if (data === "[DONE]") continue

					try {
						const event = JSON.parse(data)

						if (event.type === "response.output_text.delta") {
							yield {
								type: "text" as const,
								text: event.delta || "",
							}
						}

						if (event.type === "response.completed" && event.response?.usage) {
							yield {
								type: "usage" as const,
								inputTokens: event.response.usage.input_tokens || 0,
								outputTokens: event.response.usage.output_tokens || 0,
								cacheWriteTokens: 0,
								cacheReadTokens: 0,
							}
						}
					} catch {
						// Skip malformed JSON lines
					}
				}
			}
		} catch (error: any) {
			console.error("Agentica createMessageWithResponsesApi error:", error)
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
