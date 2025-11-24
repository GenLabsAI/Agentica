import type { ModelInfo } from "../model.js"

export type AgenticaModelId = keyof typeof agenticaModels

export const agenticaDefaultModelId: AgenticaModelId = "deca-2.5-pro"

export const AGENTICA_DEFAULT_BASE_URL = "https://api.genlabs.dev/deca/v1" as const

export const agenticaModels = {
	"deca-2.5-pro": {
		maxTokens: 64_000,
		contextWindow: 200_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Agentica's deca-2.5-pro general-purpose reasoning and coding model (OpenAI-compatible).",
	},
} as const satisfies Record<string, ModelInfo>
