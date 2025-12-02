import { calculateApiCostAnthropic, calculateApiCostOpenAI, type ApiCostResult } from "../../shared/cost"

interface TokenUsage {
	input: number
	output: number
	cacheWrites?: number
	cacheReads?: number
}

// GPT-5.1 pricing (estimated)
const GPT_5_1_PRICING = {
	inputPrice: 25.0,    // $25 per million tokens
	outputPrice: 75.0,   // $75 per million tokens
	cacheWritesPrice: 3.75,
	cacheReadsPrice: 0.3
}

export function calculateGpt51Cost(tokenUsage: TokenUsage): ApiCostResult {
	const modelInfo = {
		maxTokens: 8192,
		contextWindow: 200_000,
		supportsPromptCache: true,
		...GPT_5_1_PRICING
	}

	const totalInputTokens = tokenUsage.input + (tokenUsage.cacheWrites || 0) + (tokenUsage.cacheReads || 0)
	return calculateApiCostOpenAI(
		modelInfo,
		totalInputTokens,
		tokenUsage.output,
		tokenUsage.cacheWrites,
		tokenUsage.cacheReads
	)
}

export function calculateSavings(agenticaCost: ApiCostResult, tokenUsage: TokenUsage): number {
	const gptCost = calculateGpt51Cost(tokenUsage)
	const saved = gptCost.totalCost - agenticaCost.totalCost
	return Math.max(0, saved) // Don't show negative savings
}
