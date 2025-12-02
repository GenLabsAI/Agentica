import * as vscode from "vscode"
import { getSavingsTracker } from "./tracker"
import { testSavingsTracker, testMilestones } from "./test"

export function registerSavingsCommands(context: vscode.ExtensionContext): vscode.Disposable[] {
	const commands = []

	// Command to show savings dashboard
	commands.push(
		vscode.commands.registerCommand('agentica.showSavings', async () => {
			const tracker = getSavingsTracker()
			if (!tracker) {
				vscode.window.showErrorMessage('Savings tracker not initialized')
				return
			}

			try {
				const history = await tracker.getSavingsHistory()
				const summary = await tracker.getSavingsSummary()

				// Create a simple webview panel for now
				const panel = vscode.window.createWebviewPanel(
					'agenticaSavings',
					'💰 Agentica Savings',
					vscode.ViewColumn.One,
					{
						enableScripts: true,
						retainContextWhenHidden: true
					}
				)

				// Generate HTML content
				panel.webview.html = generateSavingsHTML(summary, history)

			} catch (error) {
				vscode.window.showErrorMessage(`Failed to show savings: ${error.message}`)
			}
		})
	)

	// Command to reset savings
	commands.push(
		vscode.commands.registerCommand('agentica.resetSavings', async () => {
			const tracker = getSavingsTracker()
			if (!tracker) {
				vscode.window.showErrorMessage('Savings tracker not initialized')
				return
			}

			const result = await vscode.window.showWarningMessage(
				'Are you sure you want to reset all savings data? This cannot be undone.',
				'Reset',
				'Cancel'
			)

			if (result === 'Reset') {
				await tracker.resetSavings()
			}
		})
	)

	// Command to export savings data
	commands.push(
		vscode.commands.registerCommand('agentica.exportSavings', async () => {
			const tracker = getSavingsTracker()
			if (!tracker) {
				vscode.window.showErrorMessage('Savings tracker not initialized')
				return
			}

			try {
				const history = await tracker.getSavingsHistory()
				const summary = await tracker.getSavingsSummary()

				const exportData = {
					summary,
					history,
					exportDate: new Date().toISOString()
				}

				const uri = await vscode.window.showSaveDialog({
					defaultUri: vscode.Uri.file('agentica-savings.json'),
					filters: {
						'JSON Files': ['json']
					}
				})

				if (uri) {
					await vscode.workspace.fs.writeFile(
						uri,
						Buffer.from(JSON.stringify(exportData, null, 2))
					)
					vscode.window.showInformationMessage(`Savings exported to ${uri.fsPath}`)
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to export savings: ${error.message}`)
			}
		})
	)

	// Test commands for development
	commands.push(
		vscode.commands.registerCommand('agentica.testSavings', testSavingsTracker)
	)

	commands.push(
		vscode.commands.registerCommand('agentica.testMilestones', testMilestones)
	)

	return commands
}

function generateSavingsHTML(summary: any, history: any): string {
	const formatPrice = (price: number) => `$${price.toFixed(2)}`
	const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agentica Savings</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid var(--vscode-panel-border);
            padding-bottom: 20px;
        }
        .summary {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: var(--vscode-descriptionForeground);
        }
        .summary-card .value {
            font-size: 2em;
            font-weight: bold;
            color: var(--vscode-charts-green);
        }
        .history {
            background: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
        }
        .history h3 {
            margin-top: 0;
        }
        .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .history-item:last-child {
            border-bottom: none;
        }
        .savings-positive {
            color: var(--vscode-charts-green);
        }
        .milestone {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>💰 Agentica Savings Tracker</h1>
        <p>Your cumulative savings compared to premium AI models</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total Saved</h3>
            <div class="value">${formatPrice(summary.totalSaved)}</div>
        </div>
        <div class="summary-card">
            <h3>Interactions</h3>
            <div class="value">${summary.entryCount}</div>
        </div>
        <div class="summary-card">
            <h3>Last Milestone</h3>
            <div class="value">$${summary.lastMilestone}</div>
        </div>
    </div>

    <div class="history">
        <h3>📊 Savings History</h3>
        ${history.history.length === 0 
			? '<p>No savings history yet. Start using Agentica to see your savings!</p>'
			: history.history.map((entry: any, index: number) => `
				<div class="history-item">
					<div>
						<span class="savings-positive">${formatPrice(entry.saved)}</span>
						<span>vs ${entry.model}</span>
						${index < 10 && entry.saved >= 1 ? '<span class="milestone">🏆 Milestone</span>' : ''}
					</div>
					<div>${formatDate(entry.date)}</div>
				</div>
			`).join('')
		}
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => {
            vscode.postMessage({ command: 'refresh' })
        }, 30000);
    </script>
</body>
</html>
	`
}
