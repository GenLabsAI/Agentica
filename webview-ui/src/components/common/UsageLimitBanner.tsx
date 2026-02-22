import { memo, useState } from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "@src/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { telemetryClient } from "@src/utils/TelemetryClient"
import { TelemetryEventName } from "@roo-code/types"
import { AlertCircle } from "lucide-react"

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
		<div className="relative p-3 border-l-4 border-vscode-charts-blue bg-vscode-editor-background mb-3">
			{/* Close button */}
			<button
				onClick={handleDismiss}
				className="absolute top-2 right-2 bg-transparent border-none cursor-pointer text-sm p-1 opacity-60 hover:opacity-100 transition-opacity duration-200 leading-none"
				aria-label={t("common:dismiss")}>
				×
			</button>

			{/* Content */}
			<div className="flex items-start gap-3 pr-6">
				<AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-vscode-charts-blue" />
				<div className="flex-1 min-w-0">
					<div className="font-medium text-sm mb-1 text-vscode-foreground">
						{t("chat:usageLimit.title", { defaultValue: "Request Limit" } as Record<string, any>)}
					</div>
					<div className="text-xs text-vscode-descriptionForeground mb-3 leading-relaxed">
						{errorMessage}
					</div>
					
					{/* Action button */}
					<VSCodeButton 
						onClick={handleUpgrade} 
						appearance="secondary"
						className="text-xs py-1 px-3">
						{t("common:upgrade", { defaultValue: "Upgrade" } as Record<string, any>)}
					</VSCodeButton>
				</div>
			</div>
		</div>
	)
})

UsageLimitBanner.displayName = "UsageLimitBanner"

export default UsageLimitBanner
