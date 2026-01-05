import React, { useState, useEffect } from "react"
import { VSCodeTextField, VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import type { ProviderSettings } from "@roo-code/types"
import { vscode } from "@/utils/vscode"
import { AgenticaClient } from "@/services/AgenticaClient"
import { securePasswordStorage } from "@/utils/passwordStorage"

type AgenticaProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const Agentica: React.FC<AgenticaProps> = ({ apiConfiguration, setApiConfigurationField }) => {
	const [subscription, setSubscription] = useState<any>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Load stored password on component mount
	useEffect(() => {
		const loadStoredPassword = async () => {
			try {
				const storedPassword = await securePasswordStorage.getPassword('agentica')
				if (storedPassword && !apiConfiguration.agenticaPassword) {
					setApiConfigurationField("agenticaPassword", storedPassword)
				}
			} catch (error) {
				console.error('Failed to load stored password:', error)
			}
		}
		loadStoredPassword()
	}, [])

	// Fetch subscription status when credentials are provided
	useEffect(() => {
		if (apiConfiguration.agenticaEmail && apiConfiguration.agenticaPassword) {
			fetchSubscription()
		}
	}, [apiConfiguration.agenticaEmail, apiConfiguration.agenticaPassword])

	const fetchSubscription = async () => {
		if (!apiConfiguration.agenticaEmail || !apiConfiguration.agenticaPassword) return
		
		setLoading(true)
		setError(null)
		try {
			const client = new AgenticaClient(
				`${apiConfiguration.agenticaEmail}|${apiConfiguration.agenticaPassword}`,
				apiConfiguration.agenticaBaseUrl
			)
			const subscriptionData = await client.getSubscription()
			setSubscription(subscriptionData)
		} catch (err: any) {
			console.error("Failed to fetch subscription:", err)
			setError("Failed to fetch subscription status")
		} finally {
			setLoading(false)
		}
	}

	const handleLogin = async () => {
		if (!apiConfiguration.agenticaEmail || !apiConfiguration.agenticaPassword) {
			setError("Please enter both email and password")
			return
		}
		
		try {
			// Store password securely
			await securePasswordStorage.storePassword('agentica', apiConfiguration.agenticaPassword)
		} catch (error) {
			console.error('Failed to store password securely:', error)
			// Continue with login even if password storage fails
		}
		
		await fetchSubscription()
	}

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
					Enter your GenLabs account credentials to use Agentica's models.
				</p>
			</div>
			{/* GitHub Sign‑In Button */}
			<VSCodeButton
			    onClick={() => vscode.postMessage({ type: "githubSignIn" })}
			    style={{
			        width: "100%",
			        marginBottom: "8px",
			        backgroundColor: "#333",
			        color: "white",
			        border: "1px solid #555",
			        padding: "10px",
			        borderRadius: "5px",
			        display: "flex",
			        alignItems: "center",
			        justifyContent: "center",
			        cursor: "pointer",
			    }}
			>
			    <img
			        src="https://simpleicons.org/icons/github.svg"
			        alt="GitHub"
			        style={{
			            filter: "invert(1)",
			            marginRight: "8px",
			            width: "20px",
			            height: "20px",
			        }}
			    />
			    <span>Continue with GitHub</span>
			</VSCodeButton>

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

				{/* Add Login Button */}
				<VSCodeButton
					onClick={handleLogin}
					disabled={loading || !apiConfiguration.agenticaEmail || !apiConfiguration.agenticaPassword}
					style={{ marginTop: "8px" }}>
					{loading ? "Logging in..." : "Login"}
				</VSCodeButton>

				{error && (
					<div style={{ color: "var(--vscode-errorForeground)", fontSize: "12px", marginTop: "4px" }}>
						{error}
					</div>
				)}
			</div>

			{/* Display subscription status if available */}
			{subscription && (
				<div style={{
					marginTop: "16px",
					padding: "12px",
					backgroundColor: "var(--vscode-editor-inactiveSelectionBackground)",
					borderRadius: "6px",
					border: "1px solid var(--vscode-panel-border)"
				}}>
					<div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
						Current Plan: {subscription.data.plan_tier.toUpperCase()}
					</div>
					<div style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
						Daily Credits: ${subscription.data.daily_credits_remaining.toFixed(2)} / ${subscription.limits.daily_credits.toFixed(2)}
					</div>
					<div style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
						Daily Requests: {subscription.limits.daily_requests} requests
					</div>
				</div>
			)}

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
