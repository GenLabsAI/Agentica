import type { ModelInfo } from "../model.js"

export type AgenticaModelId = keyof typeof agenticaModels

export const agenticaDefaultModelId: AgenticaModelId = "deca-coder-flash"

export const AGENTICA_DEFAULT_BASE_URL = "https://api.genlabs.dev/agentica/v1" as const

export const agenticaModels = {
	"deca-coder-flash": {
		maxTokens: 64_000,
		contextWindow: 200_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Agentica's deca-coder-flash general-purpose reasoning and coding model (OpenAI-compatible).",
		creditsMultiplier: 0, // Free model - 0x credits
	},
	"qwen3-coder": {
		maxTokens: 32_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Qwen3 Coder - specialized coding model with enhanced code generation capabilities.",
		creditsMultiplier: 5, // First three models cost 5x credits
	},
	"deepseek-v3.1-terminus": {
		maxTokens: 64_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "DeepSeek v3.1 Terminus - advanced reasoning and coding model with improved performance.",
		creditsMultiplier: 5, // First three models cost 5x credits
	},
	"minimax-m2": {
		maxTokens: 32_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "MiniMax M2 - efficient language model optimized for conversational AI.",
		creditsMultiplier: 5, // First three models cost 5x credits
	},
	"kimi-k2-instruct-0905": {
		maxTokens: 128_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Kimi K2 Instruct - large context model with enhanced instruction following capabilities.",
		creditsMultiplier: 10, // Kimi K2 costs 10x credits
	},
} as const satisfies Record<string, ModelInfo>
