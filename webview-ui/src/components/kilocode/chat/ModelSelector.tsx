import { useMemo } from "react"
import { SelectDropdown, DropdownOptionType } from "@/components/ui"
import { OPENROUTER_DEFAULT_PROVIDER_NAME, type ProviderSettings } from "@roo-code/types"
import { vscode } from "@src/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { cn } from "@src/lib/utils"
import { prettyModelName } from "../../../utils/prettyModelName"
import { useProviderModels } from "../hooks/useProviderModels"
import { getModelIdKey, getSelectedModelId } from "../hooks/useSelectedModel"
import { usePreferredModels } from "@/components/ui/hooks/kilocode/usePreferredModels"
import { AgenticaClient } from "@/services/AgenticaClient"

// Helper function to format cost for Agentica models
const formatAgenticaCost = (modelInfo?: any): string => {
	if (!modelInfo) return "Free"

	// Check if model requires paid plan (paid-free models)
	if (modelInfo.requiresPaidPlan) {
		return "Free"
	}

	// Check if model has token-based pricing (premium models)
	if (modelInfo.inputPrice !== undefined && modelInfo.outputPrice !== undefined &&
	    (modelInfo.inputPrice > 0 || modelInfo.outputPrice > 0)) {
		// For premium models, show a generic "Premium" label since token costs vary
		return "Premium"
	}

	// Check if model has credit-based pricing (free models)
	if (modelInfo.creditsMultiplier !== undefined) {
		if (modelInfo.creditsMultiplier === 0) {
			return "Free"
		}
		const cost = modelInfo.creditsMultiplier * 0.001
		return `$${cost.toFixed(3)}`
	}

	return "Free"
}

interface ModelSelectorProps {
	currentApiConfigName?: string
	apiConfiguration: ProviderSettings
	fallbackText: string
	virtualQuotaActiveModel?: { id: string; name: string } // kilocode_change: Add virtual quota active model for UI display
}

export const ModelSelector = ({
	currentApiConfigName,
	apiConfiguration,
	fallbackText,
	virtualQuotaActiveModel, //kilocode_change
}: ModelSelectorProps) => {
	const { t } = useAppTranslation()
	const { provider, providerModels, providerDefaultModel, isLoading, isError } = useProviderModels(apiConfiguration)
	const selectedModelId = getSelectedModelId({
		provider,
		apiConfiguration,
		defaultModelId: providerDefaultModel,
	})
	const modelIdKey = getModelIdKey({ provider })

	const modelsIds = usePreferredModels(providerModels)
	const options = useMemo(() => {
		const missingModelIds = modelsIds.indexOf(selectedModelId) >= 0 ? [] : [selectedModelId]
		return missingModelIds.concat(modelsIds).map((modelId) => {
			const modelInfo = providerModels[modelId]
			const modelName = modelInfo?.displayName ?? prettyModelName(modelId)
			
			// Add cost information for Agentica models
			let label = modelName
			if (provider === "agentica" && modelInfo) {
				const cost = formatAgenticaCost(modelInfo)
				label = `${modelName} (${cost})`
			}
			
			return {
				value: modelId,
				label,
				type: DropdownOptionType.ITEM,
			}
		})
	}, [modelsIds, providerModels, selectedModelId, provider])

	const disabled = isLoading || isError

	const onChange = async (value: string) => {
		if (!currentApiConfigName) {
			return
		}
		if (apiConfiguration[modelIdKey] === value) {
			// don't reset openRouterSpecificProvider
			return
		}

		// Check if this is a premium/paid Agentica model and user needs to upgrade
		const modelInfo = providerModels[value]
		if (provider === "agentica" && modelInfo &&
		    (modelInfo.requiresPaidPlan ||
		     (modelInfo.inputPrice && modelInfo.inputPrice > 0) ||
		     (modelInfo.outputPrice && modelInfo.outputPrice > 0))) {
			try {
				const client = new AgenticaClient(
					`${apiConfiguration?.agenticaEmail || ""}|${apiConfiguration?.agenticaPassword || ""}`,
					apiConfiguration?.agenticaBaseUrl,
				)
				const subscription = await client.getSubscription()

				// If user doesn't have premium access, navigate to plans page
				if (!subscription.limits.allow_premium) {
					vscode.postMessage({ type: "switchTab", tab: "plans" })
					return
				}
			} catch (error) {
				console.error("Failed to check Agentica subscription:", error)
				// If we can't check subscription, allow the change (fail open)
			}
		}

		vscode.postMessage({
			type: "upsertApiConfiguration",
			text: currentApiConfigName,
			apiConfiguration: {
				...apiConfiguration,
				[modelIdKey]: value,
				openRouterSpecificProvider: OPENROUTER_DEFAULT_PROVIDER_NAME,
			},
		})
	}

	if (isLoading) {
		return null
	}

	// kilocode_change start: Display active model for virtual quota fallback
	if (provider === "virtual-quota-fallback" && virtualQuotaActiveModel) {
		return (
			<span className="text-xs text-vscode-descriptionForeground opacity-70 truncate">
				{prettyModelName(virtualQuotaActiveModel.id)}
			</span>
		)
	}
	// kilocode_change end

	if (isError || options.length <= 0) {
		return <span className="text-xs text-vscode-descriptionForeground opacity-70 truncate">{fallbackText}</span>
	}

	return (
		<SelectDropdown
			value={selectedModelId}
			disabled={disabled}
			title={t("chat:selectApiConfig")}
			options={options}
			onChange={onChange}
			contentClassName="max-h-[300px] overflow-y-auto"
			triggerClassName={cn(
				"w-full text-ellipsis overflow-hidden p-0",
				"bg-transparent border-transparent hover:bg-transparent hover:border-transparent",
			)}
			triggerIcon={false}
			itemClassName="group"
		/>
	)
}
