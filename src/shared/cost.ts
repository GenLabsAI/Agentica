import type { ModelInfo } from "@roo-code/types"

export interface ApiCostResult {
	totalInputTokens: number
	totalOutputTokens: number
	totalCost: number
}

function calculateApiCostInternal(
	modelInfo: ModelInfo,
	inputTokens: number,
	outputTokens: number,
	cacheCreationInputTokens: number,
	cacheReadInputTokens: number,
	totalInputTokens: number,
	totalOutputTokens: number,
): ApiCostResult {
	// For Agentica models, check if we should use token-based pricing or credit-based pricing
	const hasTokenPricing = modelInfo.inputPrice !== undefined && modelInfo.outputPrice !== undefined &&
	                       (modelInfo.inputPrice > 0 || modelInfo.outputPrice > 0)

	if (hasTokenPricing) {
		// Token-based pricing for premium models (like other providers)
		const inputPricePerToken = (modelInfo.inputPrice || 0) / 1_000_000
		const outputPricePerToken = (modelInfo.outputPrice || 0) / 1_000_000
		const cacheWritesPricePerToken = (modelInfo.cacheWritesPrice || modelInfo.inputPrice || 0) / 1_000_000
		const cacheReadsPricePerToken = (modelInfo.cacheReadsPrice || 0) / 1_000_000

		const inputCost = inputTokens * inputPricePerToken
		const outputCost = outputTokens * outputPricePerToken
		const cacheWriteCost = cacheCreationInputTokens * cacheWritesPricePerToken
		const cacheReadCost = cacheReadInputTokens * cacheReadsPricePerToken

		const totalCost = inputCost + outputCost + cacheWriteCost + cacheReadCost

		return {
			totalInputTokens,
			totalOutputTokens,
			totalCost,
		}
	} else {
		// Credit-based pricing for free models
		// Cost = creditsMultiplier * $0.001 (where 10 credits = 1 cent)
		const creditsMultiplier = modelInfo.creditsMultiplier || 0
		const totalCost = creditsMultiplier * 0.001 // $0.001 per credit

		return {
			totalInputTokens,
			totalOutputTokens,
			totalCost,
		}
	}
}

// For Anthropic compliant usage, the input tokens count does NOT include the
// cached tokens.
export function calculateApiCostAnthropic(
	modelInfo: ModelInfo,
	inputTokens: number,
	outputTokens: number,
	cacheCreationInputTokens?: number,
	cacheReadInputTokens?: number,
): ApiCostResult {
	const cacheCreation = cacheCreationInputTokens || 0
	const cacheRead = cacheReadInputTokens || 0

	// For Anthropic: inputTokens does NOT include cached tokens
	// Total input = base input + cache creation + cache reads
	const totalInputTokens = inputTokens + cacheCreation + cacheRead

	return calculateApiCostInternal(
		modelInfo,
		inputTokens,
		outputTokens,
		cacheCreation,
		cacheRead,
		totalInputTokens,
		outputTokens,
	)
}

// For OpenAI compliant usage, the input tokens count INCLUDES the cached tokens.
export function calculateApiCostOpenAI(
	modelInfo: ModelInfo,
	inputTokens: number,
	outputTokens: number,
	cacheCreationInputTokens?: number,
	cacheReadInputTokens?: number,
): ApiCostResult {
	const cacheCreationInputTokensNum = cacheCreationInputTokens || 0
	const cacheReadInputTokensNum = cacheReadInputTokens || 0
	const nonCachedInputTokens = Math.max(0, inputTokens - cacheCreationInputTokensNum - cacheReadInputTokensNum)

	// For OpenAI: inputTokens ALREADY includes all tokens (cached + non-cached)
	// So we pass the original inputTokens as the total
	return calculateApiCostInternal(
		modelInfo,
		nonCachedInputTokens,
		outputTokens,
		cacheCreationInputTokensNum,
		cacheReadInputTokensNum,
		inputTokens,
		outputTokens,
	)
}

export const parseApiPrice = (price: any) => (price ? parseFloat(price) * 1_000_000 : undefined)
