import { memo, useState } from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "@src/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { telemetryClient } from "@src/utils/TelemetryClient"
import { TelemetryEventName } from "@roo-code/types"
import { Crown } from "lucide-react"

interface UsageLimitBannerProps {
	/** Error message to display */
	errorMessage: string
	/** Optional callback when upgrade is clicked */
	onUpgrade?: () => void
}

const UsageLimitBanner = memo(({ errorMessage, onUpgrade }: UsageLimitBannerProps) => {
	const { t } = useAppTranslation()
	const [isDismissed, setIsDismissed] = useState(false)

	if (isDismissed) {
		return null
	}

	const handleDismiss = () => {
		setIsDismissed(true)
		telemetryClient.capture(TelemetryEventName.UPSELL_DISMISSED, {
			upsellId: "usage-limit-error",
		})
	}

	const handleUpgrade = () => {
		telemetryClient.capture(TelemetryEventName.UPSELL_CLICKED, {
			upsellId: "usage-limit-error",
		})

		if (onUpgrade) {
			onUpgrade()
		} else {
			vscode.postMessage({
				type: "upgradeButtonClicked",
			})
		}
	}

	return (
		<div className="relative p-4 pr-12 border rounded-lg bg-gradient-to-r from-vscode-warningBackground to-vscode-errorBackground text-vscode-foreground border-vscode-warningForeground mb-4 shadow-sm">
			{/* Close button */}
			<button
				onClick={handleDismiss}
				className="absolute top-2 right-2 bg-transparent border-none cursor-pointer text-xl p-1 opacity-70 hover:opacity-100 transition-opacity duration-200 leading-none"
				aria-label={t("common:dismiss")}>
				×
			</button>

			{/* Content */}
			<div className="flex items-start gap-3">
				<Crown className="w-5 h-5 mt-0.5 flex-shrink-0 text-vscode-foreground" />
				<div className="flex-1 min-w-0">
					<div className="font-semibold mb-2">
						{t("chat:usageLimit.title", "Request Limit Reached")}
					</div>
					<div className="text-sm opacity-90 mb-3">
						{errorMessage}
					</div>
					
					{/* Action button */}
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
