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
		isFree: true,
	},
	"qwen3-coder": {
		maxTokens: 32_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Qwen3 Coder - specialized coding model with enhanced code generation capabilities.",
		creditsMultiplier: 0, // Free model - 0x credits
		isFree: true,
	},
	"deepseek-v3.1-terminus": {
		maxTokens: 64_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "DeepSeek v3.1 Terminus - advanced reasoning and coding model with improved performance.",
		creditsMultiplier: 0, // Free model - 0x credits
		isFree: true,
	},
	"minimax-m2": {
		maxTokens: 32_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "MiniMax M2 - efficient language model optimized for conversational AI.",
		creditsMultiplier: 0, // Free model - 0x credits
		isFree: true,
	},
	"kimi-k2": {
		maxTokens: 128_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Kimi K2",
		creditsMultiplier: 0, // Free model - 0x credits
		isFree: true,
	},
	"gpt-oss-120b": {
		maxTokens: 32_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "GPT OSS 120B.",
		creditsMultiplier: 0, // Free model - 0x credits
		isFree: true,
	},
	"glm-4.6": {
		maxTokens: 32_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "GLM 4.6 (Free on Paid plans).",
		requiresPaidPlan: true,
		// No creditsMultiplier - paid-free model requires paid plan
	},
	"kimi-k2-thinking": {
		maxTokens: 128_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Kimi K2 Thinking (free on paid plans).",
		requiresPaidPlan: true,
		// No creditsMultiplier - paid-free model requires paid plan
	},
	"claude-4.5-sonnet": {
		maxTokens: 64_000,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 3.0, // $3 per million input tokens
		outputPrice: 15.0, // $15 per million output tokens
		description: "Claude 4.5 Sonnet.",
	},
	"claude-4.5-opus": {
		maxTokens: 64_000,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 5.0, // $5 per million input tokens
		outputPrice: 25.0, // $25 per million output tokens
		description: "Claude 4.5 Opus.",
	},
	"gpt-5.1": {
		maxTokens: 128_000,
		contextWindow: 128_000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 1.25, // $1.25 per million input tokens
		outputPrice: 10, // $10 per million output tokens
		description: "GPT-5.1.",
	},
	"gpt-5.1-codex": {
		maxTokens: 128_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 1.25, // $1.25 per million input tokens
		outputPrice: 10, // $10 per million output tokens
		description: "GPT-5.1 Codex.",
	},
	"gpt-5.1-mini": {
		maxTokens: 64_000,
		contextWindow: 128_000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 0.25, // $0.25 per million input tokens
		outputPrice: 0.2, // $0.2 per million output tokens
		description: "GPT-5.1 Mini.",
	},
	"gemini-3-pro": {
		maxTokens: 64_000,
		contextWindow: 1_000_000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 2.0, // $2 per million input tokens
		outputPrice: 12.0, // $12 per million output tokens
		description: "Gemini 3 Pro.",
	},
	"grok-4": {
		maxTokens: 128_000,
		contextWindow: 128_000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 3.0, // $5 per million input tokens
		outputPrice: 15.0, // $15 per million output tokens
		description: "Grok 4.",
	},
	"grok-code-fast-1": {
		maxTokens: 64_000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 0.2, // $3 per million input tokens
		outputPrice: 1.5, // $12 per million output tokens
		description: "Grok Code Fast 1.",
	},
} as const satisfies Record<string, ModelInfo>
