import * as vscode from "vscode"
import * as fs from "fs/promises"
import * as path from "path"

export interface SavingsEntry {
	date: string
	saved: number
	model: string
	agenticaCost: number
	comparisonCost: number
	tokens: {
		input: number
		output: number
		cacheWrites?: number
		cacheReads?: number
	}
}

export interface SavingsData {
	totalSaved: number
	lastMilestone: number
	history: SavingsEntry[]
	lastUpdated: string
}

export class SavingsStorage {
	private static readonly SAVINGS_FILE = "savings.json"

	constructor(private readonly context: vscode.ExtensionContext) {}

	private getStoragePath(): string {
		return path.join(this.context.globalStorageUri.fsPath, SavingsStorage.SAVINGS_FILE)
	}

	async loadSavings(): Promise<SavingsData> {
		try {
			const storagePath = this.getStoragePath()
			const data = await fs.readFile(storagePath, "utf-8")
			const parsed = JSON.parse(data)
			
			// Validate structure
			return {
				totalSaved: parsed.totalSaved || 0,
				lastMilestone: parsed.lastMilestone || 0,
				history: Array.isArray(parsed.history) ? parsed.history : [],
				lastUpdated: parsed.lastUpdated || new Date().toISOString()
			}
		} catch (error) {
			// File doesn't exist or is corrupted, return default
			return {
				totalSaved: 0,
				lastMilestone: 0,
				history: [],
				lastUpdated: new Date().toISOString()
			}
		}
	}

	async saveSavings(savings: SavingsData): Promise<void> {
		try {
			// Ensure storage directory exists
			const storageDir = this.context.globalStorageUri.fsPath
			await fs.mkdir(storageDir, { recursive: true })

			const storagePath = this.getStoragePath()
			await fs.writeFile(storagePath, JSON.stringify(savings, null, 2))
		} catch (error) {
			console.error("Failed to save savings data:", error)
			throw error
		}
	}

	async addSavings(entry: Omit<SavingsEntry, "date">): Promise<{ saved: number; newMilestone?: number }> {
		const savings = await this.loadSavings()
		
		const newEntry: SavingsEntry = {
			...entry,
			date: new Date().toISOString()
		}

		savings.totalSaved += entry.saved
		savings.history.push(newEntry)
		savings.lastUpdated = newEntry.date

		// Check for milestone
		const currentMilestone = Math.floor(savings.totalSaved)
		let newMilestone: number | undefined

		if (currentMilestone > savings.lastMilestone) {
			newMilestone = currentMilestone
			savings.lastMilestone = currentMilestone
		}

		await this.saveSavings(savings)
		return { saved: entry.saved, newMilestone }
	}

	async resetSavings(): Promise<void> {
		const defaultSavings: SavingsData = {
			totalSaved: 0,
			lastMilestone: 0,
			history: [],
			lastUpdated: new Date().toISOString()
		}
		await this.saveSavings(defaultSavings)
	}

	async getSavingsSummary(): Promise<{ totalSaved: number; entryCount: number; lastMilestone: number }> {
		const savings = await this.loadSavings()
		return {
			totalSaved: savings.totalSaved,
			entryCount: savings.history.length,
			lastMilestone: savings.lastMilestone
		}
	}
}
