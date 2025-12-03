import React from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import type { ProviderSettings } from "@roo-code/types"

type AgenticaProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const Agentica: React.FC<AgenticaProps> = ({ apiConfiguration, setApiConfigurationField }) => {
	return (
		<div
			style={{
				border: "1px solid var(--vscode-panel-border)",
				borderRadius: "8px",
				padding: "16px",
				backgroundColor: "var(--vscode-editor-background)",
				marginTop: "8px"
			}}>
			<div style={{ marginBottom: "16px" }}>
				<h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "var(--vscode-foreground)" }}>
					Sign in with GenLabs
				</h3>
				<p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "var(--vscode-descriptionForeground)", lineHeight: "1.4" }}>
					Enter your GenLabs account credentials to use Agentica's deca-2.5-pro model.
				</p>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
				<VSCodeTextField
					value={apiConfiguration.agenticaEmail || ""}
					onChange={(e: any) => setApiConfigurationField("agenticaEmail", e.target.value)}
					placeholder="your-email@example.com"
					style={{ width: "100%" }}>
					<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
						Email
						<span style={{ opacity: 0.7, fontSize: "0.9em" }}>(required)</span>
					</span>
				</VSCodeTextField>

				<VSCodeTextField
					value={apiConfiguration.agenticaPassword || ""}
					onChange={(e: any) => setApiConfigurationField("agenticaPassword", e.target.value)}
					placeholder="Your GenLabs password"
					type="password"
					style={{ width: "100%" }}>
					<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
						Password
						<span style={{ opacity: 0.7, fontSize: "0.9em" }}>(required)</span>
					</span>
				</VSCodeTextField>
			</div>

			<div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--vscode-panel-border)" }}>
				<div style={{ fontSize: "0.85em", color: "var(--vscode-descriptionForeground)", lineHeight: "1.4" }}>
					New to GenLabs?{" "}
					<a
						href="https://genlabs.dev/signup"
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: "var(--vscode-textLink-foreground)", textDecoration: "underline" }}>
						Create your free account
					</a>
					{" "}to get started with Agentica.
				</div>
			</div>
		</div>
	)
}
