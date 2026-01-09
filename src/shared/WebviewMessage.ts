import { z } from "zod"

import {
	type RooCodeSettings,
	type ProviderSettings,
	type PromptComponent,
	type ModeConfig,
	type InstallMarketplaceItemOptions,
	type MarketplaceItem,
	type ShareVisibility,
	type QueuedMessage,
	marketplaceItemSchema,
	// kilocode_change start
	CommitRange,
	HistoryItem,
	GlobalState,
	// kilocode_change end
} from "@roo-code/types"

import { Mode } from "./modes"
import { MicrophoneDevice } from "./sttContract" // kilocode_change: Microphone device type for STT

export type ClineAskResponse =
	| "yesButtonClicked"
	| "noButtonClicked"
	| "messageResponse"
	| "objectResponse"
	| "retry_clicked" // kilocode_change: Added retry_clicked for payment required dialog

export type PromptMode = Mode | "enhance"

export type AudioType = "notification" | "celebration" | "progress_loop"

export interface UpdateTodoListPayload {
	todos: any[]
}

export type EditQueuedMessagePayload = Pick<QueuedMessage, "id" | "text" | "images">

// kilocode_change start: Type-safe global state update message
export type GlobalStateValue<K extends keyof GlobalState> = GlobalState[K]
export type UpdateGlobalStateMessage<K extends keyof GlobalState = keyof GlobalState> = {
	type: "updateGlobalState"
	stateKey: K
	stateValue: GlobalStateValue<K>
}
// kilocode_change end: Type-safe global state update message
export interface WebviewMessage {
	type:
		| "clearSecurePassword"
		| "storeSecurePassword"
		| "getSecurePassword"
		| "chatCompletionAccepted"
		| "action"
		| "updateTodoList"
		| "deleteMultipleTasksWithIds"
		| "currentApiConfigName"
		| "saveApiConfiguration"
		| "upsertApiConfiguration"
		| "deleteApiConfiguration"
		| "loadApiConfiguration"
		| "loadApiConfigurationById"
		| "githubSignIn"
		| "getProfileConfigurationForEditing"
		| "renameApiConfiguration"
		| "getListApiConfiguration"
		| "customInstructions"
		| "webviewDidLaunch"
		| "newTask"
		| "askResponse"
		| "terminalOperation"
		| "clearTask"
		| "didShowAnnouncement"
		| "selectImages"
		| "exportCurrentTask"
		| "shareCurrentTask"
		| "showTaskWithId"
		| "deleteTaskWithId"
		| "exportTaskWithId"
		| "importSettings"
		| "toggleToolAutoApprove"
		| "openExtensionSettings"
		| "openInBrowser"
		| "fetchOpenGraphData"
		| "checkIsImageUrl"
		| "exportSettings"
		| "resetState"
		| "flushRouterModels"
		| "requestRouterModels"
		| "requestOpenAiModels"
		| "requestOllamaModels"
		| "requestLmStudioModels"
		| "requestRooModels"
		| "requestRooCreditBalance"
		| "requestVsCodeLmModels"
		| "requestHuggingFaceModels"
		| "requestSapAiCoreModels"
		| "requestSapAiCoreDeployments"
		| "requestFileContent"
		| "openImage"
		| "saveImage"
		| "openFile"
		| "openMention"
		| "cancelTask"
		| "cancelAutoApproval"
		| "updateVSCodeSetting"
		| "getVSCodeSetting"
		| "vsCodeSetting"
		| "updateCondensingPrompt"
		| "yoloGatekeeperApiConfigId"
		| "playSound"
		| "playTts"
		| "stopTts"
		| "ttsEnabled"
		| "ttsSpeed"
		| "openKeyboardShortcuts"
		| "openMcpSettings"
		| "openProjectMcpSettings"
		| "restartMcpServer"
		| "refreshAllMcpServers"
		| "toggleToolAlwaysAllow"
		| "toggleToolEnabledForPrompt"
		| "toggleMcpServer"
		| "updateMcpTimeout"
		| "fuzzyMatchThreshold"
		| "morphApiKey"
		| "fastApplyModel"
		| "fastApplyApiProvider"
		| "writeDelayMs"
		| "diagnosticsEnabled"
		| "enhancePrompt"
		| "enhancedPrompt"
		| "draggedImages"
		| "deleteMessage"
		| "deleteMessageConfirm"
		| "submitEditedMessage"
		| "editMessageConfirm"
		| "enableMcpServerCreation"
		| "remoteControlEnabled"
		| "taskSyncEnabled"
		| "searchCommits"
		| "setApiConfigPassword"
		| "mode"
		| "updatePrompt"
		| "getSystemPrompt"
		| "copySystemPrompt"
		| "systemPrompt"
		| "enhancementApiConfigId"
		| "commitMessageApiConfigId"
		| "terminalCommandApiConfigId"
		| "ghostServiceSettings"
		| "stt:start"
		| "stt:stop"
		| "stt:cancel"
		| "stt:checkAvailability"
		| "stt:listDevices"
		| "stt:selectDevice"
		| "includeTaskHistoryInEnhance"
		| "snoozeAutocomplete"
		| "autoApprovalEnabled"
		| "yoloMode"
		| "updateCustomMode"
		| "deleteCustomMode"
		| "setopenAiCustomModelInfo"
		| "openCustomModesSettings"
		| "checkpointDiff"
		| "checkpointRestore"
		| "requestCheckpointRestoreApproval"
		| "seeNewChanges"
		| "startCodeReview"
		| "deleteMcpServer"
		| "humanRelayResponse"
		| "humanRelayCancel"
		| "insertTextToChatArea"
		| "codebaseIndexEnabled"
		| "telemetrySetting"
		| "testBrowserConnection"
		| "browserConnectionResult"
		| "allowVeryLargeReads"
		| "showFeedbackOptions"
		| "fetchMcpMarketplace"
		| "silentlyRefreshMcpMarketplace"
		| "fetchLatestMcpServersFromHub"
		| "downloadMcp"
		| "showSystemNotification"
		| "showAutoApproveMenu"
		| "reportBug"
		| "profileButtonClicked"
		| "fetchProfileDataRequest"
		| "profileDataResponse"
		| "fetchBalanceDataRequest"
		| "shopBuyCredits"
		| "balanceDataResponse"
		| "updateProfileData"
		| "condense"
		| "toggleWorkflow"
		| "refreshRules"
		| "toggleRule"
		| "createRuleFile"
		| "deleteRuleFile"
		| "searchFiles"
		| "toggleApiConfigPin"
		| "hasOpenedModeSelector"
		| "cloudButtonClicked"
		| "rooCloudSignIn"
		| "cloudLandingPageSignIn"
		| "rooCloudSignOut"
		| "rooCloudManualUrl"
		| "switchOrganization"
		| "condenseTaskContextRequest"
		| "requestIndexingStatus"
		| "startIndexing"
		| "cancelIndexing"
		| "clearIndexData"
		| "indexingStatusUpdate"
		| "indexCleared"
		| "focusPanelRequest"
		| "clearUsageData"
		| "getUsageData"
		| "usageDataResponse"
		| "showTaskTimeline"
		| "sendMessageOnEnter"
		| "showTimestamps"
		| "hideCostBelowThreshold"
		| "toggleTaskFavorite"
		| "fixMermaidSyntax"
		| "mermaidFixResponse"
		| "openGlobalKeybindings"
		| "getKeybindings"
		| "setReasoningBlockCollapsed"
		| "setHistoryPreviewCollapsed"
		| "openExternal"
		| "filterMarketplaceItems"
		| "mcpButtonClicked"
		| "marketplaceButtonClicked"
		| "upgradeButtonClicked"
		| "installMarketplaceItem"
		| "installMarketplaceItemWithParameters"
		| "cancelMarketplaceInstall"
		| "removeInstalledMarketplaceItem"
		| "marketplaceInstallResult"
		| "fetchMarketplaceData"
		| "switchTab"
		| "profileThresholds"
		| "editMessage"
		| "systemNotificationsEnabled"
		| "dismissNotificationId"
		| "tasksByIdRequest"
		| "taskHistoryRequest"
		| "updateGlobalState"
		| "autoPurgeEnabled"
		| "autoPurgeDefaultRetentionDays"
		| "autoPurgeFavoritedTaskRetentionDays"
		| "autoPurgeCompletedTaskRetentionDays"
		| "autoPurgeIncompleteTaskRetentionDays"
		| "manualPurge"
		| "shareTaskSuccess"
		| "exportMode"
		| "exportModeResult"
		| "importMode"
		| "importModeResult"
		| "checkRulesDirectory"
		| "checkRulesDirectoryResult"
		| "saveCodeIndexSettingsAtomic"
		| "requestCodeIndexSecretStatus"
		| "fetchKilocodeNotifications"
		| "requestCommands"
		| "openCommandFile"
		| "deleteCommand"
		| "createCommand"
		| "insertTextIntoTextarea"
		| "showMdmAuthRequiredNotification"
		| "imageGenerationSettings"
		| "kiloCodeImageApiKey"
		| "queueMessage"
		| "removeQueuedMessage"
		| "editQueuedMessage"
		| "dismissUpsell"
		| "getDismissedUpsells"
		| "updateSettings"
		| "requestManagedIndexerState"
		| "allowedCommands"
		| "deniedCommands"
		| "killBrowserSession"
		| "openBrowserSessionPanel"
		| "showBrowserSessionPanelAtStep"
		| "refreshBrowserSessionPanel"
		| "browserPanelDidLaunch"
		| "addTaskToHistory"
		| "sessionShare"
		| "shareTaskSession"
		| "sessionFork"
		| "sessionShow"
		| "sessionSelect"
		| "singleCompletion"
		| "openDebugApiHistory"
		| "openDebugUiHistory"
		| "startDeviceAuth"
		| "startAgenticaDeviceAuth"
		| "cancelAgenticaDeviceAuth"
		| "cancelDeviceAuth"
		| "deviceAuthCompleteWithProfile"
		| "requestChatCompletion"
	text?: string
	suggestionLength?: number
	completionRequestId?: string
	shareId?: string
	sessionId?: string
	editedMessageContent?: string
	action?: string
	tab?: "settings" | "history" | "mcp" | "modes" | "chat" | "marketplace" | "cloud" | "plans" | "auth"
	disabled?: boolean
	context?: string
	dataUri?: string
	askResponse?: ClineAskResponse
	apiConfiguration?: ProviderSettings
	images?: string[]
	bool?: boolean
	value?: number
	stepIndex?: number
	isLaunchAction?: boolean
	forceShow?: boolean
	commands?: string[]
	audioType?: AudioType
	notificationOptions?: {
		title?: string
		subtitle?: string
		message: string
	}
	mcpId?: string
	toolNames?: string[]
	autoApprove?: boolean
	workflowPath?: string
	enabled?: boolean
	rulePath?: string
	isGlobal?: boolean
	filename?: string
	ruleType?: string
	notificationId?: string
	commandIds?: string[]
	serverName?: string
	toolName?: string
	alwaysAllow?: boolean
	isEnabled?: boolean
	mode?: Mode
	promptMode?: PromptMode
	customPrompt?: PromptComponent
	dataUrls?: string[]
	values?: Record<string, any>
	query?: string
	setting?: string
	slug?: string
	language?: string
	device?: MicrophoneDevice | null
	modeConfig?: ModeConfig
	timeout?: number
	payload?: WebViewMessagePayload
	source?: "global" | "project"
	requestId?: string
	ids?: string[]
	hasSystemPromptOverride?: boolean
	terminalOperation?: "continue" | "abort"
	messageTs?: number
	restoreCheckpoint?: boolean
	historyPreviewCollapsed?: boolean
	filters?: { type?: string; search?: string; tags?: string[] }
	settings?: any
	url?: string
	mpItem?: MarketplaceItem
	mpInstallOptions?: InstallMarketplaceItemOptions
	config?: Record<string, any>
	visibility?: ShareVisibility
	hasContent?: boolean
	checkOnly?: boolean
	upsellId?: string
	list?: string[]
	organizationId?: string | null
	taskId?: string
	filePath?: string
	useProviderSignup?: boolean
	historyItem?: HistoryItem
	key?: string
	password?: string
	codeIndexSettings?: {
		codebaseIndexEnabled: boolean
		codebaseIndexQdrantUrl: string
		codebaseIndexEmbedderProvider:
			| "openai"
			| "ollama"
			| "openai-compatible"
			| "gemini"
			| "mistral"
			| "vercel-ai-gateway"
			| "bedrock"
			| "openrouter"
		codebaseIndexVectorStoreProvider?: "lancedb" | "qdrant"
		codebaseIndexLancedbVectorStoreDirectory?: string
		codebaseIndexEmbedderBaseUrl?: string
		codebaseIndexEmbedderModelId: string
		codebaseIndexEmbedderModelDimension?: number
		codebaseIndexOpenAiCompatibleBaseUrl?: string
		codebaseIndexBedrockRegion?: string
		codebaseIndexBedrockProfile?: string
		codebaseIndexSearchMaxResults?: number
		codebaseIndexSearchMinScore?: number
		codebaseIndexEmbeddingBatchSize?: number
		codebaseIndexScannerMaxBatchRetries?: number
		codebaseIndexOpenRouterSpecificProvider?: string
		codeIndexOpenAiKey?: string
		codeIndexQdrantApiKey?: string
		codebaseIndexOpenAiCompatibleApiKey?: string
		codebaseIndexGeminiApiKey?: string
		codebaseIndexMistralApiKey?: string
		codebaseIndexVercelAiGatewayApiKey?: string
		codebaseIndexOpenRouterApiKey?: string
	}
	updatedSettings?: RooCodeSettings
}

// kilocode_change: Create discriminated union for type-safe messages
export type MaybeTypedWebviewMessage = WebviewMessage | UpdateGlobalStateMessage

// kilocode_change begin
export type OrganizationRole = "owner" | "admin" | "member"

export type UserOrganizationWithApiKey = {
	id: string
	name: string
	balance: number
	role: OrganizationRole
	apiKey: string
}

export type ProfileData = {
	kilocodeToken: string
	user: {
		id: string
		name: string
		email: string
		image: string
	}
	organizations?: UserOrganizationWithApiKey[]
}

export interface ProfileDataResponsePayload {
	success: boolean
	data?: ProfileData
	error?: string
}

export interface BalanceDataResponsePayload {
	// New: Payload for balance data
	success: boolean
	data?: any // Replace 'any' with a more specific type if known for balance
	error?: string
}

export interface SeeNewChangesPayload {
	commitRange: CommitRange
}

export interface TasksByIdRequestPayload {
	requestId: string
	taskIds: string[]
}

export interface TaskHistoryRequestPayload {
	requestId: string
	workspace: "current" | "all"
	sort: "newest" | "oldest" | "mostExpensive" | "mostTokens" | "mostRelevant"
	favoritesOnly: boolean
	pageIndex: number
	search?: string
}

export interface TasksByIdResponsePayload {
	requestId: string
	tasks: HistoryItem[]
}

export interface TaskHistoryResponsePayload {
	requestId: string
	historyItems: HistoryItem[]
	pageIndex: number
	pageCount: number
}
// kilocode_change end

export const checkoutDiffPayloadSchema = z.object({
	ts: z.number().optional(),
	previousCommitHash: z.string().optional(),
	commitHash: z.string(),
	mode: z.enum(["full", "checkpoint", "from-init", "to-current"]),
})

export type CheckpointDiffPayload = z.infer<typeof checkoutDiffPayloadSchema>

export const checkoutRestorePayloadSchema = z.object({
	ts: z.number(),
	commitHash: z.string(),
	mode: z.enum(["preview", "restore"]),
})

export type CheckpointRestorePayload = z.infer<typeof checkoutRestorePayloadSchema>

export const requestCheckpointRestoreApprovalPayloadSchema = z.object({
	commitHash: z.string(),
	checkpointTs: z.number(),
	messagesToRemove: z.number(),
	confirmationText: z.string(),
})

export type RequestCheckpointRestoreApprovalPayload = z.infer<typeof requestCheckpointRestoreApprovalPayloadSchema>

export interface IndexingStatusPayload {
	state: "Standby" | "Indexing" | "Indexed" | "Error"
	message: string
}

export interface IndexClearedPayload {
	success: boolean
	error?: string
}

export const installMarketplaceItemWithParametersPayloadSchema = z.object({
	item: marketplaceItemSchema,
	parameters: z.record(z.string(), z.any()),
})

export type InstallMarketplaceItemWithParametersPayload = z.infer<
	typeof installMarketplaceItemWithParametersPayloadSchema
>

export type WebViewMessagePayload =
	// kilocode_change start
	| ProfileDataResponsePayload
	| BalanceDataResponsePayload
	| SeeNewChangesPayload
	| TasksByIdRequestPayload
	| TaskHistoryRequestPayload
	| RequestCheckpointRestoreApprovalPayload
	// kilocode_change end
	| CheckpointDiffPayload
	| CheckpointRestorePayload
	| IndexingStatusPayload
	| IndexClearedPayload
	| InstallMarketplaceItemWithParametersPayload
	| UpdateTodoListPayload
	| EditQueuedMessagePayload
