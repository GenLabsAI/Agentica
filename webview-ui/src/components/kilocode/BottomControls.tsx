import React from "react"
import { vscode } from "../../utils/vscode"
import { useAppTranslation } from "@/i18n/TranslationContext"
import KiloRulesToggleModal from "./rules/KiloRulesToggleModal"
import BottomButton from "./BottomButton"
import { BottomApiConfig } from "./BottomApiConfig" // kilocode_change

interface BottomControlsProps {
	showApiConfig?: boolean
	showCodeReviewButton?: boolean
	onCodeReviewClick?: () => void
}

const BottomControls: React.FC<BottomControlsProps> = ({ showApiConfig = false, showCodeReviewButton = false, onCodeReviewClick }) => {
	const { t } = useAppTranslation()

	const showFeedbackOptions = () => {
		vscode.postMessage({ type: "showFeedbackOptions" })
	}

	return (
		<div className="flex flex-row w-auto items-center justify-between h-[30px] mx-3.5 mt-2.5 mb-1 gap-1">
			<div className="flex flex-item flex-row justify-start gap-1 grow overflow-hidden">
				{showApiConfig && <BottomApiConfig />}
			</div>
			<div className="flex flex-row justify-end w-auto">
				<div className="flex items-center gap-1">
					{showCodeReviewButton && (
						<BottomButton
							iconClass="codicon-check-circle"
							title={t("chat:codeReview.button", "Review with Deca")}
							onClick={onCodeReviewClick || (() => {})}
						/>
					)}
					<KiloRulesToggleModal />
					<BottomButton
						iconClass="codicon-feedback"
						title={t("common:feedback.title")}
						onClick={showFeedbackOptions}
					/>
				</div>
			</div>
		</div>
	)
}

export default BottomControls
