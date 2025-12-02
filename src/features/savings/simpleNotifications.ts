import * as vscode from "vscode"
import { SimpleSavingsTracker } from "./simpleTracker"

export class SimpleSavingsNotifications {
	constructor(private readonly tracker: SimpleSavingsTracker) {}

	async showMilestone(milestone: number, totalSaved: number): Promise<void> {
		const message = `🎉 You've saved $${milestone} with Agentica! Total: $${totalSaved.toFixed(2)}`
		
		await vscode.window.showInformationMessage(message, "Nice!")
	}

	async checkAndShowMilestone(saved: number): Promise<void> {
		const newMilestone = await this.tracker.addSavings(saved)
		
		if (newMilestone) {
			const totalSaved = await this.tracker.getTotalSaved()
			await this.showMilestone(newMilestone, totalSaved)
		}
	}
}
