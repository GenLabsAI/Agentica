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
	"kimi-k2": {
		user_facing_name: "kimi-k2",
		provider_model_id: "moonshotai/kimi-k2-instruct-0905",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "Moonshot AI Kimi K2 model"
	},
	"deca-2.5-pro-low": {
		user_facing_name: "deca-2.5-pro-low",
		provider_model_id: "moonshot-ai/kimi-k2-thinking",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "2.5 pro low"
	},
	"minimax-m2": {
		user_facing_name: "minimax-m2",
		provider_model_id: "minimaxai/minimax-m2",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "Minimax M2 model"
	},
	"deepseek-v3.1-terminus": {
		user_facing_name: "deepseek-v3.1-terminus",
		provider_model_id: "deepseek-ai/deepseek-v3.1-terminus",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "DeepSeek V3.1 Terminus"
	},
	"qwen3-coder": {
		user_facing_name: "qwen3-coder",
		provider_model_id: "qwen/qwen3-coder-480b-a35b-instruct",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "Qwen 3 Coder 480B"
	},
	"gpt-oss-120b": {
		user_facing_name: "gpt-oss-120b",
		provider_model_id: "openai/gpt-oss-120b",
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "GPT OSS 120B"
	},
	"deca-coder-flash": {
		user_facing_name: "deca-coder-flash",
		provider_model_id: "deca-coder-flash",  // Special: uses classification
		provider: PROVIDER_NVIDIA_NIM,
		category: "free" as const,
		description: "Deca Coder Flash (routes via classification)"
	},
} as const satisfies Record<string, ModelConfig>

// =========================================================================
//                    Paid-Free Models (OpenRouter)
// =========================================================================
// Available ONLY to paid users (Plus, Pro, Max)
// No credit cost, but requires paid plan

export const PAID_FREE_MODELS = {
	"glm-4.6": {
		user_facing_name: "glm-4.6",
		provider_model_id: "zai/glm-4.6",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_FEATHERLESS
		category: "paid_free" as const,
		description: "GLM 4.6 (paid plans only, no credit cost)"
	},
	"kimi-k2-thinking": {
		user_facing_name: "kimi-k2-thinking",
		provider_model_id: "moonshotai/kimi-k2-thinking",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_FEATHERLESS
		category: "paid_free" as const,
		description: "Kimi K2 Thinking (paid plans only, no credit cost)"
	},
} as const satisfies Record<string, ModelConfig>

// =========================================================================
//                    Premium Models (OpenRouter)
// =========================================================================
// Available ONLY to paid users (Plus, Pro, Max)
// Costs Agentica daily credits based on usage

export const PREMIUM_MODELS = {
	"claude-4.5-sonnet": {
		user_facing_name: "claude-4.5-sonnet",
		provider_model_id: "anthropic/claude-4.5-sonnet",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Claude 4.5 Sonnet"
	},
	"claude-4.5-opus": {
		user_facing_name: "claude-4.5-opus",
		provider_model_id: "anthropic/claude-4.5-opus",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Claude 4.5 Opus"
	},
	"gpt-5.2": {
		user_facing_name: "gpt-5.2",
		provider_model_id: "openai/gpt-5.2",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "GPT-5.2"
	},
	"gemini-3-flash": {
		user_facing_name: "gemini-3-flash",
		provider_model_id: "google/gemini-3-flash-preview",
		provider: PROVIDER_OPENROUTER,
		category: "free" as const, // Note: this is marked as "free" in the original but in premium section
		description: "Gemini 3 Flash"
	},
	"gpt-5.1-codex": {
		user_facing_name: "gpt-5.1-codex",
		provider_model_id: "openai/gpt-5.1-codex",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "GPT-5.1 Codex"
	},
	"gpt-5.1-codex-mini": {
		user_facing_name: "gpt-5.1-codex-mini",
		provider_model_id: "openai/gpt-5.1-codex-mini",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "GPT-5.1 Codex Mini"
	},
	"gemini-3-pro": {
		user_facing_name: "gemini-3-pro",
		provider_model_id: "google/gemini-3-pro",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Gemini 3 Pro"
	},
	"gemini-2.5-flash": {
		user_facing_name: "gemini-2.5-flash",
		provider_model_id: "google/gemini-2.5-flash",
		provider: PROVIDER_OPENROUTER,  // Will change to PROVIDER_ELECTRONHUB
		category: "premium" as const,
		description: "Gemini 2.5 Flash"
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
