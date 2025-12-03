import * as vscode from "vscode"
import { getSavingsTracker } from "./tracker"

/**
 * Test function to verify the savings tracker is working
 */
export async function testSavingsTracker(): Promise<void> {
	const tracker = getSavingsTracker()
	if (!tracker) {
		vscode.window.showErrorMessage("Savings tracker not initialized")
		return
	}

	try {
		// Simulate a savings calculation
		await tracker.trackSavings(
			{
				maxTokens: 8192,
				contextWindow: 200_000,
				supportsPromptCache: true,
				inputPrice: 3.0,
				outputPrice: 15.0,
				cacheWritesPrice: 3.75,
				cacheReadsPrice: 0.3
			},
			{
				input: 1000,
				output: 500,
				cacheWrites: 200,
				cacheReads: 100
			},
			"gpt-5.1"
		)

		// Get and display the summary
		const summary = await tracker.getSavingsSummary()
		
		vscode.window.showInformationMessage(
			`✅ Savings tracker test successful! Total saved: $${summary.totalSaved.toFixed(2)}`
		)

		console.log("Savings tracker test completed:", summary)
	} catch (error) {
		vscode.window.showErrorMessage(`Savings tracker test failed: ${error.message}`)
		console.error("Savings tracker test error:", error)
	}
}

/**
 * Test milestone notifications
 */
export async function testMilestones(): Promise<void> {
	const tracker = getSavingsTracker()
	if (!tracker) {
		vscode.window.showErrorMessage("Savings tracker not initialized")
		return
	}

	// Reset savings first
	await tracker.resetSavings()

	// Add multiple small savings to trigger milestones
	for (let i = 0; i < 5; i++) {
		await tracker.trackSavings(
			{
				maxTokens: 8192,
				contextWindow: 200_000,
				supportsPromptCache: true,
				inputPrice: 3.0,
				outputPrice: 15.0,
				cacheWritesPrice: 3.75,
				cacheReadsPrice: 0.3
			},
			{
				input: 2000,
				output: 1000,
				cacheWrites: 400,
				cacheReads: 200
			},
			"gpt-5.1"
		)
	}

	const summary = await tracker.getSavingsSummary()
	vscode.window.showInformationMessage(
		`🎯 Milestone test completed! Total saved: $${summary.totalSaved.toFixed(2)}, Milestone: $${summary.lastMilestone}`
	)
}
