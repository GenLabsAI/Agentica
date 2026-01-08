import * as vscode from "vscode"
import { getSavingsTracker } from "./agenticaSavings"

// Test command to verify savings tracker works
export async function testSimpleSavings(): Promise<void> {
	const tracker = getSavingsTracker()
	if (!tracker) {
		vscode.window.showErrorMessage("Savings tracker not initialized")
		return
	}

	// Simulate a savings event
	await tracker.trackSavings(
		{
			maxTokens: 8192,
			contextWindow: 200_000,
			supportsPromptCache: true,
			inputPrice: 3.0,
			outputPrice: 15.0
		},
		{
			input: 1000,
			output: 500,
			cacheWrites: 200,
			cacheReads: 100
		}
	)

	const total = await tracker.getTotalSaved()
	vscode.window.showInformationMessage(`✅ Test successful! Total saved: $${total.toFixed(2)}`)
}
