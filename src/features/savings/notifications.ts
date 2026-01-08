import * as vscode from "vscode"
import { formatPrice } from "../../../webview-ui/src/utils/formatPrice"
import type { SavingsStorage } from "./storage"

export interface MilestoneNotification {
	milestone: number
	totalSaved: number
	message: string
}

export class SavingsNotifications {
	constructor(private readonly storage: SavingsStorage) {}

	/**
	 * Show milestone notification when user reaches a new dollar milestone
	 */
	async showMilestoneNotification(milestone: number, totalSaved: number): Promise<void> {
		const message = `🎉 You've saved $${milestone} with Agentica! Total savings: ${formatPrice(totalSaved)}`
		
		const result = await vscode.window.showInformationMessage(
			message,
			'View Details',
			'Dismiss'
		)

		if (result === 'View Details') {
			await vscode.commands.executeCommand('agentica.showSavings')
		}
	}

	/**
	 * Show small savings indicator in status bar
	 */
	showSavingsStatus(saved: number, comparisonModel: string): void {
		const message = `💰 Saved ${formatPrice(saved)} vs ${comparisonModel}`
		vscode.window.setStatusBarMessage(message, 5000) // Show for 5 seconds
	}

	/**
	 * Show detailed savings breakdown
	 */
	async showSavingsBreakdown(saved: number, agenticaCost: number, comparisonCost: number, comparisonModel: string): Promise<void> {
		const message = `
💰 Savings Breakdown:
• Agentica: ${formatPrice(agenticaCost)}
• ${comparisonModel}: ${formatPrice(comparisonCost)}
• You saved: ${formatPrice(saved)} (${((saved / comparisonCost) * 100).toFixed(1)}%)
		`.trim()

		await vscode.window.showInformationMessage(message, 'OK')
	}

	/**
	 * Create animated celebration effect (future enhancement)
	 */
	private async celebrateMilestone(milestone: number): Promise<void> {
		// This could be enhanced with animations, sounds, etc.
		// For now, just show the notification
		console.log(`🎉 Milestone reached: $${milestone}`)
	}

	/**
	 * Check and show milestone if reached
	 */
	async checkAndShowMilestone(newTotalSaved: number): Promise<void> {
		const savings = await this.storage.loadSavings()
		const currentMilestone = Math.floor(newTotalSaved)
		
		if (currentMilestone > savings.lastMilestone && currentMilestone > 0) {
			await this.showMilestoneNotification(currentMilestone, newTotalSaved)
			await this.celebrateMilestone(currentMilestone)
		}
	}

	/**
	 * Show welcome message for first-time users
	 */
	async showWelcomeMessage(): Promise<void> {
		const savings = await this.storage.loadSavings()
		
		if (savings.history.length === 0) {
			const message = "💰 Start saving with Agentica! We'll track your savings compared to GPT-5.1 and other models."
			
			await vscode.window.showInformationMessage(
				message,
				'Learn More',
				'Dismiss'
			)
		}
	}
}
