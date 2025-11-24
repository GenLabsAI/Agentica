import React from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

interface AgenticaProps {
	apiConfiguration: any
	setApiConfigurationField: (field: string, value: any) => void
}

export const Agentica: React.FC<AgenticaProps> = ({ apiConfiguration, setApiConfigurationField }) => {
	return (
		<>
			<VSCodeTextField
				value={apiConfiguration.agenticaBaseUrl || ""}
				onChange={(e: any) => setApiConfigurationField("agenticaBaseUrl", e.target.value)}
				placeholder="https://api.genlabs.dev/deca/v1"
				style={{ width: "100%" }}
			>
				<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
					Base URL
					<span style={{ opacity: 0.7, fontSize: "0.9em" }}>(optional)</span>
				</span>
			</VSCodeTextField>

			<VSCodeTextField
				value={apiConfiguration.agenticaEmail || ""}
				onChange={(e: any) => setApiConfigurationField("agenticaEmail", e.target.value)}
				placeholder="your-email@example.com"
				style={{ width: "100%", marginTop: "8px" }}
			>
				<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
					Email
					<span style={{ opacity: 0.7, fontSize: "0.9em" }}>(required)</span>
				</span>
			</VSCodeTextField>

			<VSCodeTextField
				value={apiConfiguration.agenticaPassword || ""}
				onChange={(e: any) => setApiConfigurationField("agenticaPassword", e.target.value)}
				placeholder="Your password"
				type="password"
				style={{ width: "100%", marginTop: "8px" }}
			>
				<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
					Password
					<span style={{ opacity: 0.7, fontSize: "0.9em" }}>(required)</span>
				</span>
			</VSCodeTextField>

			<div style={{ marginTop: "12px", fontSize: "0.9em", opacity: 0.8 }}>
				Don't have an account?{" "}
				<a 
					href="https://genlabs.dev/signup" 
					target="_blank" 
					rel="noopener noreferrer"
					style={{ color: "#007acc", textDecoration: "underline" }}
				>
					Sign up for GenLabs
				</a>
			</div>
		</>
	)
}
