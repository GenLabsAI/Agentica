import * as vscode from "vscode"
import * as fs from "fs/promises"
import * as path from "path"

export interface SimpleSavingsData {
	totalSaved: number
	lastMilestone: number
}

export class SimpleSavingsTracker {
	private readonly savingsFile = "savings.json"

	constructor(private readonly context: vscode.ExtensionContext) {}

	private getStoragePath(): string {
		return path.join(this.context.globalStorageUri.fsPath, this.savingsFile)
	}

	async loadSavings(): Promise<SimpleSavingsData> {
		try {
			const data = await fs.readFile(this.getStoragePath(), "utf-8")
			return JSON.parse(data)
		} catch {
			return { totalSaved: 0, lastMilestone: 0 }
		}
	}

	async saveSavings(data: SimpleSavingsData): Promise<void> {
		try {
			await fs.mkdir(this.context.globalStorageUri.fsPath, { recursive: true })
			await fs.writeFile(this.getStoragePath(), JSON.stringify(data))
		} catch (error) {
			console.error("Failed to save savings:", error)
		}
	}

	async addSavings(saved: number): Promise<number | undefined> {
		const data = await this.loadSavings()
		data.totalSaved += saved
		
		const currentMilestone = Math.floor(data.totalSaved)
		let newMilestone: number | undefined

		if (currentMilestone > data.lastMilestone && currentMilestone > 0) {
			newMilestone = currentMilestone
			data.lastMilestone = currentMilestone
		}

		await this.saveSavings(data)
		return newMilestone
	}

	async getTotalSaved(): Promise<number> {
		const data = await this.loadSavings()
		return data.totalSaved
	}
}
