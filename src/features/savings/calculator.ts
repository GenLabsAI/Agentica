import type { ModelInfo } from "@roo-code/types"
import { calculateApiCostAnthropic, calculateApiCostOpenAI, type ApiCostResult } from "../../shared/cost"

export interface ComparisonModel {
	id: string
	name: string
	provider: 'openai' | 'anthropic' | 'openrouter'
	pricing: {
		inputPrice: number  // per million tokens
		outputPrice: number // per million tokens
		cacheWritesPrice?: number
		cacheReadsPrice?: number
	}
}

export interface TokenUsage {
	input: number
	output: number
	cacheWrites?: number
	cacheReads?: number
}

export interface SavingsCalculation {
	agenticaCost: number
	comparisonCost: number
	saved: number
	savedPercentage: number
	comparisonModel: ComparisonModel
	tokenUsage: TokenUsage
}

// GPT-5.1 pricing (estimated - these would need to be updated with actual pricing)
export const GPT_5_1_MODEL: ComparisonModel = {
	id: 'gpt-5.1',
	name: 'GPT-5.1',
	provider: 'openai',
	pricing: {
		inputPrice: 25.0,    // $25 per million tokens (estimated)
		outputPrice: 75.0,   // $75 per million tokens (estimated)
		cacheWritesPrice: 3.75,
		cacheReadsPrice: 0.3
	}
}

export const COMPARISON_MODELS: ComparisonModel[] = [
	GPT_5_1_MODEL,
	{
		id: 'gpt-4o',
		name: 'GPT-4o',
		provider: 'openai',
		pricing: {
			inputPrice: 5.0,    // $5 per million tokens
			outputPrice: 15.0,  // $15 per million tokens
			cacheWritesPrice: 3.75,
			cacheReadsPrice: 0.3
		}
	},
	{
		id: 'claude-3-5-sonnet',
		name: 'Claude 3.5 Sonnet',
		provider: 'anthropic',
		pricing: {
			inputPrice: 3.0,    // $3 per million tokens
			outputPrice: 15.0,  // $15 per million tokens
			cacheWritesPrice: 3.75,
			cacheReadsPrice: 0.3
		}
	}
]

export class SavingsCalculator {
	/**
	 * Calculate savings between Agentica and a comparison model
	 */
	static calculateSavings(
		agenticaCostResult: ApiCostResult,
		comparisonModel: ComparisonModel,
		tokenUsage: TokenUsage
	): SavingsCalculation {
		// Calculate comparison model cost
		const comparisonCostResult = this.calculateComparisonCost(comparisonModel, tokenUsage)
		
		const agenticaCost = agenticaCostResult.totalCost
		const comparisonCost = comparisonCostResult.totalCost
		const saved = Math.max(0, comparisonCost - agenticaCost) // Don't show negative savings
		const savedPercentage = comparisonCost > 0 ? (saved / comparisonCost) * 100 : 0

		return {
			agenticaCost,
			comparisonCost,
			saved,
			savedPercentage,
			comparisonModel,
			tokenUsage
		}
	}

	/**
	 * Calculate cost for a comparison model
	 */
	private static calculateComparisonCost(model: ComparisonModel, tokenUsage: TokenUsage): ApiCostResult {
		const modelInfo: ModelInfo = {
			maxTokens: 8192, // Default value
			contextWindow: 200_000, // Default value
			supportsPromptCache: !!(model.pricing.cacheWritesPrice || model.pricing.cacheReadsPrice),
			inputPrice: model.pricing.inputPrice,
			outputPrice: model.pricing.outputPrice,
			cacheWritesPrice: model.pricing.cacheWritesPrice,
			cacheReadsPrice: model.pricing.cacheReadsPrice
		}

		// Use appropriate calculation method based on provider
		if (model.provider === 'anthropic') {
			return calculateApiCostAnthropic(
				modelInfo,
				tokenUsage.input,
				tokenUsage.output,
				tokenUsage.cacheWrites,
				tokenUsage.cacheReads
			)
		} else {
			// For OpenAI and OpenRouter (OpenAI compliant)
			const totalInputTokens = tokenUsage.input + (tokenUsage.cacheWrites || 0) + (tokenUsage.cacheReads || 0)
			return calculateApiCostOpenAI(
				modelInfo,
				totalInputTokens,
				tokenUsage.output,
				tokenUsage.cacheWrites,
				tokenUsage.cacheReads
			)
		}
	}

	/**
	 * Get comparison model by ID
	 */
	static getComparisonModel(id: string): ComparisonModel | undefined {
		return COMPARISON_MODELS.find(model => model.id === id)
	}

	/**
	 * Get default comparison model (GPT-5.1)
	 */
	static getDefaultComparisonModel(): ComparisonModel {
		return GPT_5_1_MODEL
	}
}
