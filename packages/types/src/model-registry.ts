import { z } from "zod"

// Provider constants
export const PROVIDER_NVIDIA_NIM = "agentica" as const
export const PROVIDER_OPENROUTER = "openrouter" as const
export const PROVIDER_FEATHERLESS = "featherless" as const
export const PROVIDER_ELECTRONHUB = "electronhub" as const

// Model category types
export const modelCategories = ["free", "paid_free", "premium"] as const
export const modelCategorySchema = z.enum(modelCategories)
export type ModelCategory = z.infer<typeof modelCategorySchema>

// ModelConfig schema
export const modelConfigSchema = z.object({
	user_facing_name: z.string(),
	provider_model_id: z.string(),
	provider: z.string(),
	category: modelCategorySchema,
	description: z.string(),
})

export type ModelConfig = z.infer<typeof modelConfigSchema>

// =========================================================================
//                    Free Models
// =========================================================================

export const FREE_MODELS = {
	"kimi-k2.5": {
		user_facing_name: "kimi-k2.5",
		provider_model_id: "moonshot-ai/kimi-k2.5",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "Kimi K2.5"
	},
	"minimax-m2.1": {
		user_facing_name: "minimax-m2.1",
		provider_model_id: "minimaxai/minimax-m2.1",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "Minimax M2 model"
	},
	"deepseek-v3.2": {
		user_facing_name: "deepseek-v3.2",
		provider_model_id: "deepseek-ai/deepseek-v3.2",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "DeepSeek V3.2 (free)"
	},
	"glm-5": {
		user_facing_name: "glm-5",
		provider_model_id: "zai/glm-5",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "GLM 5 (free)"
	},
	"qwen3.5": {
		user_facing_name: "qwen3.5",
		provider_model_id: "qwen/qwen3.5-397b-a17b",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "Qwen 3.5"
	},
	"gpt-oss-120b": {
		user_facing_name: "gpt-oss-120b",
		provider_model_id: "openai/gpt-oss-120b",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "GPT OSS 120B"
	},
} as const satisfies Record<string, ModelConfig>

// =========================================================================
//                    Paid-Free Models (OpenRouter)
// =========================================================================
// Available ONLY to paid users (Plus, Pro, Max)
// No credit cost, but requires paid plan

export const PAID_FREE_MODELS = {
	"minimax-m2.5": {
		user_facing_name: "minimax-m2.5",
		provider_model_id: "minimax/minimax-m2.5",
		provider: PROVIDER_OPENROUTER,
		category: "paid_free" as const,
		description: "Minimax M2.5 (paid plans only, no credit cost)"
	},
} as const satisfies Record<string, ModelConfig>

// =========================================================================
//                    Premium Models (OpenRouter)
// =========================================================================
// Available ONLY to paid users (Plus, Pro, Max)
// Costs Agentica daily credits based on usage

export const PREMIUM_MODELS = {
	"claude-4.6-sonnet": {
		user_facing_name: "claude-4.6-sonnet",
		provider_model_id: "anthropic/claude-4.6-sonnet",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Claude 4.6 Sonnet"
	},
	"claude-4.6-opus": {
		user_facing_name: "claude-4.6-opus",
		provider_model_id: "anthropic/claude-4.6-opus",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Claude 4.6 Opus"
	},
	"gpt-5.3-codex": {
		user_facing_name: "gpt-5.3",
		provider_model_id: "openai/gpt-5.3-codex",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "GPT-5.3"
	},
	"gemini-3-flash": {
		user_facing_name: "gemini-3-flash",
		provider_model_id: "google/gemini-3-flash-preview",
		provider: PROVIDER_OPENROUTER,
		category: "free" as const,
		description: "Gemini 3 Flash"
	},
	"gpt-5.1-codex-mini": {
		user_facing_name: "gpt-5.1-codex-mini",
		provider_model_id: "openai/gpt-5.1-codex-mini",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Grok 4"
	},
	"gemini-3.1-pro": {
		user_facing_name: "gemini-3.1-pro",
		provider_model_id: "google/gemini-3.1-pro-preview",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Gemini 3 Pro"
	},
	"grok-4": {
		user_facing_name: "grok-4",
		provider_model_id: "x-ai/grok-4",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Grok 4"
	},
	"grok-4.1-fast": {
		user_facing_name: "grok-4.1-fast",
		provider_model_id: "x-ai/grok-4.1-fast",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Grok 4.1 Fast"
	},
	"grok-code-fast-1": {
		user_facing_name: "grok-code-fast-1",
		provider_model_id: "x-ai/grok-code-fast-1",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Grok Code Fast 1"
	},
	"deca-2.5-pro-high": {
		user_facing_name: "deca-2.5-pro-high",
		provider_model_id: "deca-2.5-pro-high",  // Special routing model
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "2.5 pro high"
	},
	"deca-2.5-pro-low": {
		user_facing_name: "deca-2.5-pro-low",
		provider_model_id: "deca-2.5-pro-low",  // Special routing model
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "2.5 pro low"
	},
	"deca-2.5-mini": {
		user_facing_name: "deca-2.5-mini",
		provider_model_id: "deca-2.5-mini",  // Special routing: 75% gemini-3-flash-preview, 25% openai/gpt-5.1-codex-mini
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "2.5 mini premium model"
	},
} as const satisfies Record<string, ModelConfig>

// Combined model registry
export const ALL_MODELS = {
	...FREE_MODELS,
	...PAID_FREE_MODELS,
	...PREMIUM_MODELS,
} as const

// Helper functions
export const getModelConfig = (modelId: string): ModelConfig | undefined => {
	return ALL_MODELS[modelId as keyof typeof ALL_MODELS]
}

export const getModelsByCategory = (category: ModelCategory): Record<string, ModelConfig> => {
	const result: Record<string, ModelConfig> = {}

	for (const [key, config] of Object.entries(ALL_MODELS)) {
		if (config.category === category) {
			result[key] = config
		}
	}

	return result
}

export const getFreeModels = () => getModelsByCategory("free")
export const getPaidFreeModels = () => getModelsByCategory("paid_free")
export const getPremiumModels = () => getModelsByCategory("premium")
