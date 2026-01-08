import * as vscode from "vscode"
import { getSavingsTracker } from "./agenticaSavings"
import { testSimpleSavings } from "./testSimple"

export function registerSimpleSavingsCommands(context: vscode.ExtensionContext): vscode.Disposable[] {
	return [
		vscode.commands.registerCommand('agentica.testSavings', testSimpleSavings),
		
		vscode.commands.registerCommand('agentica.showTotalSaved', async () => {
			const tracker = getSavingsTracker()
			if (!tracker) {
				vscode.window.showErrorMessage('Savings tracker not initialized')
				return
			}
			
			const total = await tracker.getTotalSaved()
			vscode.window.showInformationMessage(`💰 Total saved with Agentica: $${total.toFixed(2)}`)
		})
	]
}
