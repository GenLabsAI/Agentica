import { memo, useState } from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "@src/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { telemetryClient } from "@src/utils/TelemetryClient"
import { TelemetryEventName } from "@roo-code/types"
import { AlertTriangle, Zap, Crown } from "lucide-react"

interface UsageLimitBannerProps {
	/** Type of limit reached */
	type: "opensource_limit" | "deca_limit"
	/** Optional callback when upgrade is clicked */
	onUpgrade?: () => void
	/** Optional callback when switch to deca is clicked */
	onSwitchToDeca?: () => void
}

const UsageLimitBanner = memo(({ type, onUpgrade, onSwitchToDeca }: UsageLimitBannerProps) => {
	const { t } = useAppTranslation()
	const [isDismissed, setIsDismissed] = useState(false)

	if (isDismissed) {
		return null
	}

	const handleDismiss = () => {
		setIsDismissed(true)
		telemetryClient.capture(TelemetryEventName.UPSELL_DISMISSED, {
			upsellId: `usage-limit-${type}`,
		})
	}

	const handleUpgrade = () => {
		telemetryClient.capture(TelemetryEventName.UPSELL_CLICKED, {
			upsellId: `usage-limit-${type}`,
		})

		if (onUpgrade) {
			onUpgrade()
		} else {
			vscode.postMessage({
				type: "upgradeButtonClicked",
			})
		}
	}

	const handleSwitchToDeca = () => {
		telemetryClient.capture(TelemetryEventName.UPSELL_CLICKED, {
			upsellId: `switch-to-deca-${type}`,
		})

		if (onSwitchToDeca) {
			onSwitchToDeca()
		}
	}

	// Stage 1: Open source models limit reached
	if (type === "opensource_limit") {
		return (
			<div className="relative p-4 pr-12 border rounded-lg bg-vscode-warningBackground text-vscode-warningForeground border-vscode-warningForeground mb-4">
				{/* Close button */}
				<button
					onClick={handleDismiss}
					className="absolute top-2 right-2 bg-transparent border-none cursor-pointer text-xl p-1 opacity-70 hover:opacity-100 transition-opacity duration-200 leading-none"
					aria-label={t("common:dismiss")}>
					×
				</button>

				{/* Content */}
				<div className="flex items-start gap-3">
					<AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-vscode-warningForeground" />
					<div className="flex-1 min-w-0">
						<div className="font-semibold mb-2">
							{t("chat:usageLimit.opensource.title", "Free Open Source Models Limit Reached")}
						</div>
						<div className="text-sm opacity-90 mb-3">
							{t("chat:usageLimit.opensource.message", 
								"You've used all your requests for free Open Source models. Continue with Deca 2.5 Pro, or upgrade to get access to all models."
							)}
						</div>
						
						{/* Action buttons */}
						<div className="flex flex-wrap gap-2">
							<VSCodeButton 
								onClick={handleSwitchToDeca} 
								appearance="secondary"
								className="flex items-center gap-2 whitespace-nowrap">
								<Zap className="w-4 h-4" />
								{t("chat:usageLimit.opensource.switchToDeca", "Use Deca 2.5 Pro")}
							</VSCodeButton>
							<VSCodeButton 
								onClick={handleUpgrade} 
								appearance="primary"
								className="flex items-center gap-2 whitespace-nowrap">
								<Crown className="w-4 h-4" />
								{t("common:upgrade", "Upgrade")}
							</VSCodeButton>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Stage 2: Deca models limit reached
	return (
		<div className="relative p-4 pr-12 border rounded-lg bg-vscode-errorBackground text-vscode-errorForeground border-vscode-errorForeground mb-4">
			{/* Close button */}
			<button
				onClick={handleDismiss}
				className="absolute top-2 right-2 bg-transparent border-none cursor-pointer text-xl p-1 opacity-70 hover:opacity-100 transition-opacity duration-200 leading-none"
				aria-label={t("common:dismiss")}>
				×
			</button>

			{/* Content */}
			<div className="flex items-start gap-3">
				<AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-vscode-errorForeground" />
				<div className="flex-1 min-w-0">
					<div className="font-semibold mb-2">
						{t("chat:usageLimit.deca.title", "Daily Request Limit Reached")}
					</div>
					<div className="text-sm opacity-90 mb-3">
						{t("chat:usageLimit.deca.message", 
							"You've used all your requests for today. Try again tomorrow, or upgrade to continue access."
						)}
					</div>
					
					{/* Action buttons */}
					<div className="flex flex-wrap gap-2">
						<VSCodeButton 
							onClick={handleUpgrade} 
							appearance="primary"
							className="flex items-center gap-2 whitespace-nowrap">
							<Crown className="w-4 h-4" />
							{t("common:upgrade", "Upgrade")}
						</VSCodeButton>
					</div>
				</div>
			</div>
		</div>
	)
})

UsageLimitBanner.displayName = "UsageLimitBanner"

export default UsageLimitBanner
