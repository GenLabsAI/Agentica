// npx vitest utils/__tests__/cost.spec.ts

import type { ModelInfo } from "@roo-code/types"

import { calculateApiCostAnthropic, calculateApiCostOpenAI } from "../../shared/cost"

describe("Cost Utility", () => {
	describe("calculateApiCostAnthropic", () => {
		const mockModelInfo: ModelInfo = {
			maxTokens: 8192,
			contextWindow: 200_000,
			supportsPromptCache: true,
			inputPrice: 3.0, // $3 per million tokens
			outputPrice: 15.0, // $15 per million tokens
			cacheWritesPrice: 3.75, // $3.75 per million tokens
			cacheReadsPrice: 0.3, // $0.30 per million tokens
		}

		it("should calculate basic input/output costs correctly", () => {
			const result = calculateApiCostAnthropic(mockModelInfo, 1000, 500)

			// Input cost: (3.0 / 1_000_000) * 1000 = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Total: 0.003 + 0.0075 = 0.0105
			expect(result.totalCost).toBe(0.0105)
			expect(result.totalInputTokens).toBe(1000)
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle cache writes cost", () => {
			const result = calculateApiCostAnthropic(mockModelInfo, 1000, 500, 2000)

			// Input cost: (3.0 / 1_000_000) * 1000 = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Cache writes: (3.75 / 1_000_000) * 2000 = 0.0075
			// Total: 0.003 + 0.0075 + 0.0075 = 0.018
			expect(result.totalCost).toBeCloseTo(0.018, 6)
			expect(result.totalInputTokens).toBe(3000) // 1000 + 2000
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle cache reads cost", () => {
			const result = calculateApiCostAnthropic(mockModelInfo, 1000, 500, undefined, 3000)

			// Input cost: (3.0 / 1_000_000) * 1000 = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Cache reads: (0.3 / 1_000_000) * 3000 = 0.0009
			// Total: 0.003 + 0.0075 + 0.0009 = 0.0114
			expect(result.totalCost).toBe(0.0114)
			expect(result.totalInputTokens).toBe(4000) // 1000 + 3000
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle all cost components together", () => {
			const result = calculateApiCostAnthropic(mockModelInfo, 1000, 500, 2000, 3000)

			// Input cost: (3.0 / 1_000_000) * 1000 = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Cache writes: (3.75 / 1_000_000) * 2000 = 0.0075
			// Cache reads: (0.3 / 1_000_000) * 3000 = 0.0009
			// Total: 0.003 + 0.0075 + 0.0075 + 0.0009 = 0.0189
			expect(result.totalCost).toBe(0.0189)
			expect(result.totalInputTokens).toBe(6000) // 1000 + 2000 + 3000
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle missing prices gracefully", () => {
			const modelWithoutPrices: ModelInfo = {
				maxTokens: 8192,
				contextWindow: 200_000,
				supportsPromptCache: true,
			}

			const result = calculateApiCostAnthropic(modelWithoutPrices, 1000, 500, 2000, 3000)
			expect(result.totalCost).toBe(0)
			expect(result.totalInputTokens).toBe(6000) // 1000 + 2000 + 3000
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle zero tokens", () => {
			const result = calculateApiCostAnthropic(mockModelInfo, 0, 0, 0, 0)
			expect(result.totalCost).toBe(0)
			expect(result.totalInputTokens).toBe(0)
			expect(result.totalOutputTokens).toBe(0)
		})

		it("should handle undefined cache values", () => {
			const result = calculateApiCostAnthropic(mockModelInfo, 1000, 500)

			// Input cost: (3.0 / 1_000_000) * 1000 = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Total: 0.003 + 0.0075 = 0.0105
			expect(result.totalCost).toBe(0.0105)
			expect(result.totalInputTokens).toBe(1000)
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle missing cache prices", () => {
			const modelWithoutCachePrices: ModelInfo = {
				...mockModelInfo,
				cacheWritesPrice: undefined,
				cacheReadsPrice: undefined,
			}

			const result = calculateApiCostAnthropic(modelWithoutCachePrices, 1000, 500, 2000, 3000)

			// Should only include input and output costs
			// Input cost: (3.0 / 1_000_000) * 1000 = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Total: 0.003 + 0.0075 = 0.0105
			expect(result.totalCost).toBe(0.0105)
			expect(result.totalInputTokens).toBe(6000) // 1000 + 2000 + 3000
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should apply credits multiplier correctly", () => {
			const modelWithCreditsMultiplier: ModelInfo = {
				...mockModelInfo,
				creditsMultiplier: 5, // 5x credits multiplier
			}

			const result = calculateApiCostAnthropic(modelWithCreditsMultiplier, 1000, 500)

			// Cost = creditsMultiplier * $0.001 = 5 * 0.001 = $0.005
			expect(result.totalCost).toBe(0.005)
			expect(result.totalInputTokens).toBe(1000)
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle missing credits multiplier (default to 0x)", () => {
			const result = calculateApiCostAnthropic(mockModelInfo, 1000, 500)

			// Should use default multiplier of 0 (free)
			expect(result.totalCost).toBe(0)
			expect(result.totalInputTokens).toBe(1000)
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle 0x credits multiplier (free model)", () => {
			const freeModel: ModelInfo = {
				...mockModelInfo,
				creditsMultiplier: 0, // Free model
			}

			const result = calculateApiCostAnthropic(freeModel, 1000, 500)

			// Cost = 0 * $0.001 = $0 (free)
			expect(result.totalCost).toBe(0)
			expect(result.totalInputTokens).toBe(1000)
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should apply token-based pricing for premium models", () => {
			const premiumModel: ModelInfo = {
				...mockModelInfo,
				inputPrice: 3.0, // $3 per million input tokens
				outputPrice: 15.0, // $15 per million output tokens
				// No creditsMultiplier - uses token pricing instead
			}

			const result = calculateApiCostAnthropic(premiumModel, 1000, 500)

			// Cost = (1000 * 3.0 / 1M) + (500 * 15.0 / 1M) = 0.003 + 0.0075 = $0.0105
			expect(result.totalCost).toBe(0.0105)
			expect(result.totalInputTokens).toBe(1000)
			expect(result.totalOutputTokens).toBe(500)
		})
	})

	describe("calculateApiCostOpenAI", () => {
		const mockModelInfo: ModelInfo = {
			maxTokens: 8192,
			contextWindow: 200_000,
			supportsPromptCache: true,
			inputPrice: 3.0, // $3 per million tokens
			outputPrice: 15.0, // $15 per million tokens
			cacheWritesPrice: 3.75, // $3.75 per million tokens
			cacheReadsPrice: 0.3, // $0.30 per million tokens
		}

		it("should calculate basic input/output costs correctly", () => {
			const result = calculateApiCostOpenAI(mockModelInfo, 1000, 500)

			// Input cost: (3.0 / 1_000_000) * 1000 = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Total: 0.003 + 0.0075 = 0.0105
			expect(result.totalCost).toBe(0.0105)
			expect(result.totalInputTokens).toBe(1000)
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle cache writes cost", () => {
			const result = calculateApiCostOpenAI(mockModelInfo, 3000, 500, 2000)

			// Input cost: (3.0 / 1_000_000) * (3000 - 2000) = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Cache writes: (3.75 / 1_000_000) * 2000 = 0.0075
			// Total: 0.003 + 0.0075 + 0.0075 = 0.018
			expect(result.totalCost).toBeCloseTo(0.018, 6)
			expect(result.totalInputTokens).toBe(3000) // Total already includes cache
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle cache reads cost", () => {
			const result = calculateApiCostOpenAI(mockModelInfo, 4000, 500, undefined, 3000)

			// Input cost: (3.0 / 1_000_000) * (4000 - 3000) = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Cache reads: (0.3 / 1_000_000) * 3000 = 0.0009
			// Total: 0.003 + 0.0075 + 0.0009 = 0.0114
			expect(result.totalCost).toBe(0.0114)
			expect(result.totalInputTokens).toBe(4000) // Total already includes cache
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle all cost components together", () => {
			const result = calculateApiCostOpenAI(mockModelInfo, 6000, 500, 2000, 3000)

			// Input cost: (3.0 / 1_000_000) * (6000 - 2000 - 3000) = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Cache writes: (3.75 / 1_000_000) * 2000 = 0.0075
			// Cache reads: (0.3 / 1_000_000) * 3000 = 0.0009
			// Total: 0.003 + 0.0075 + 0.0075 + 0.0009 = 0.0189
			expect(result.totalCost).toBe(0.0189)
			expect(result.totalInputTokens).toBe(6000) // Total already includes cache
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle missing prices gracefully", () => {
			const modelWithoutPrices: ModelInfo = {
				maxTokens: 8192,
				contextWindow: 200_000,
				supportsPromptCache: true,
			}

			const result = calculateApiCostOpenAI(modelWithoutPrices, 1000, 500, 2000, 3000)
			expect(result.totalCost).toBe(0)
			expect(result.totalInputTokens).toBe(1000) // Total already includes cache
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle zero tokens", () => {
			const result = calculateApiCostOpenAI(mockModelInfo, 0, 0, 0, 0)
			expect(result.totalCost).toBe(0)
			expect(result.totalInputTokens).toBe(0)
			expect(result.totalOutputTokens).toBe(0)
		})

		it("should handle undefined cache values", () => {
			const result = calculateApiCostOpenAI(mockModelInfo, 1000, 500)

			// Input cost: (3.0 / 1_000_000) * 1000 = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Total: 0.003 + 0.0075 = 0.0105
			expect(result.totalCost).toBe(0.0105)
			expect(result.totalInputTokens).toBe(1000)
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle missing cache prices", () => {
			const modelWithoutCachePrices: ModelInfo = {
				...mockModelInfo,
				cacheWritesPrice: undefined,
				cacheReadsPrice: undefined,
			}

			const result = calculateApiCostOpenAI(modelWithoutCachePrices, 6000, 500, 2000, 3000)

			// Should only include input and output costs
			// Input cost: (3.0 / 1_000_000) * (6000 - 2000 - 3000) = 0.003
			// Output cost: (15.0 / 1_000_000) * 500 = 0.0075
			// Total: 0.003 + 0.0075 = 0.0105
			expect(result.totalCost).toBe(0.0105)
			expect(result.totalInputTokens).toBe(6000) // Total already includes cache
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should apply credits multiplier correctly", () => {
			const modelWithCreditsMultiplier: ModelInfo = {
				...mockModelInfo,
				creditsMultiplier: 10, // 10x credits multiplier
			}

			const result = calculateApiCostOpenAI(modelWithCreditsMultiplier, 1000, 500)

			// Cost = creditsMultiplier * $0.001 = 10 * 0.001 = $0.01
			expect(result.totalCost).toBe(0.01)
			expect(result.totalInputTokens).toBe(1000)
			expect(result.totalOutputTokens).toBe(500)
		})

		it("should handle missing credits multiplier (default to 0x)", () => {
			const result = calculateApiCostOpenAI(mockModelInfo, 1000, 500)

			// Should use default multiplier of 0 (free)
			expect(result.totalCost).toBe(0)
			expect(result.totalInputTokens).toBe(1000)
			expect(result.totalOutputTokens).toBe(500)
		})
	})
})
