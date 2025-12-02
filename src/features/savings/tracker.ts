import * as vscode from "vscode"
import { SavingsStorage } from "./storage"
import { SavingsCalculator, type SavingsCalculation, type TokenUsage, GPT_5_1_MODEL } from "./calculator"
import { SavingsNotifications } from "./notifications"
import { calculateApiCostAnthropic, calculateApiCostOpenAI, type ApiCostResult } from "../../shared/cost"

export class SavingsTracker {
	private storage: SavingsStorage
	private notifications: SavingsNotifications

	constructor(private readonly context: vscode.ExtensionContext) {
		this.storage = new SavingsStorage(context)
		this.notifications = new SavingsNotifications(this.storage)
	}

	/**
	 * Track savings after an API call
	 */
	async trackSavings(
		agenticaModelInfo: any, // ModelInfo type
		tokenUsage: TokenUsage,
		comparisonModelId: string = GPT_5_1_MODEL.id
	): Promise<void> {
		try {
			// Calculate Agentica cost
			const agenticaCostResult = this.calculateAgenticaCost(agenticaModelInfo, tokenUsage)
			
			// Get comparison model
			const comparisonModel = SavingsCalculator.getComparisonModel(comparisonModelId)
			if (!comparisonModel) {
				console.warn(`Comparison model ${comparisonModelId} not found`)
				return
			}

			// Calculate savings
			const savings = SavingsCalculator.calculateSavings(
				agenticaCostResult,
				comparisonModel,
				tokenUsage
			)

			// Only track if there's actual savings
			if (savings.saved > 0) {
				// Save to storage and check for milestone
				const result = await this.storage.addSavings({
					saved: savings.saved,
					model: comparisonModel.name,
					agenticaCost: savings.agenticaCost,
					comparisonCost: savings.comparisonCost,
					tokens: tokenUsage
				})

				// Show milestone notification if reached
				if (result.newMilestone) {
					await this.notifications.showMilestoneNotification(
						result.newMilestone,
						savings.saved + (await this.storage.loadSavings()).totalSaved - result.saved
					)
				}

				// Show status bar notification
				this.notifications.showSavingsStatus(savings.saved, comparisonModel.name)

				console.log(`💰 Tracked savings: ${savings.saved.toFixed(4)} vs ${comparisonModel.name}`)
			}
		} catch (error) {
			console.error("Failed to track savings:", error)
		}
	}

	/**
	 * Calculate Agentica cost based on model info and token usage
	 */
	private calculateAgenticaCost(modelInfo: any, tokenUsage: TokenUsage): ApiCostResult {
		// Determine if it's Anthropic or OpenAI compliant based on model info
		const isAnthropic = modelInfo.supportsPromptCache || modelInfo.provider === 'anthropic'
		
		if (isAnthropic) {
			return calculateApiCostAnthropic(
				modelInfo,
				tokenUsage.input,
				tokenUsage.output,
				tokenUsage.cacheWrites,
				tokenUsage.cacheReads
			)
		} else {
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
	 * Get current savings summary
	 */
	async getSavingsSummary() {
		return await this.storage.getSavingsSummary()
	}

	/**
	 * Get full savings history
	 */
	async getSavingsHistory() {
		return await this.storage.loadSavings()
	}

	/**
	 * Reset all savings data
	 */
	async resetSavings(): Promise<void> {
		await this.storage.resetSavings()
		await vscode.window.showInformationMessage("Savings data has been reset.")
	}

	/**
	 * Show welcome message for new users
	 */
	async showWelcomeMessage(): Promise<void> {
		await this.notifications.showWelcomeMessage()
	}
}

// Global instance to be used across the extension
let savingsTracker: SavingsTracker | undefined

export function initializeSavingsTracker(context: vscode.ExtensionContext): SavingsTracker {
	if (!savingsTracker) {
		savingsTracker = new SavingsTracker(context)
	}
	return savingsTracker
}

export function getSavingsTracker(): SavingsTracker | undefined {
	return savingsTracker
}
