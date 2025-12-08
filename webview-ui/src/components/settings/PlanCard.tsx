import React from "react"
import { Button } from "@/components/ui/button"
import { VSCodeButton, VSCodeTag } from "@vscode/webview-ui-toolkit/react"

interface PlanCardProps {
    planId: "free" | "plus" | "pro" | "max"
    currentPlanId: string
    price: string
    period: string
    features: string[]
    onUpgrade: (planId: string) => void
    onDowngrade: (planId: string) => void
    loading?: boolean
    scheduledDowngrade?: string
}

export const PlanCard: React.FC<PlanCardProps> = ({
    planId,
    currentPlanId,
    price,
    period,
    features,
    onUpgrade,
    onDowngrade,
    loading = false,
    scheduledDowngrade,
}) => {
    const isCurrent = planId === currentPlanId
    const isDowngrade = ["free", "plus", "pro", "max"].indexOf(planId) < ["free", "plus", "pro", "max"].indexOf(currentPlanId)
    const isScheduled = scheduledDowngrade === planId

    // Determine styling based on plan
    const getPlanColor = () => {
        switch (planId) {
            case "max":
                return "var(--vscode-charts-purple)"
            case "pro":
                return "var(--vscode-charts-blue)"
            case "plus":
                return "var(--vscode-charts-green)"
            default:
                return "var(--vscode-descriptionForeground)"
        }
    }

    return (
        <div
            style={{
                border: isCurrent ? `2px solid ${getPlanColor()}` : "1px solid var(--vscode-widget-border)",
                padding: "16px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                position: "relative",
                background: isCurrent ? "var(--vscode-editor-inactiveSelectionBackground)" : "transparent",
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.2em", fontWeight: "bold", color: getPlanColor() }}>
                    {planId.charAt(0).toUpperCase() + planId.slice(1)}
                </h3>
                {isCurrent && <VSCodeTag>Current</VSCodeTag>}
                {isScheduled && <VSCodeTag>Scheduled</VSCodeTag>}
            </div>

            <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>
                {price} <span style={{ fontSize: "0.6em", fontWeight: "normal", color: "var(--vscode-descriptionForeground)" }}>/ {period}</span>
            </div>

            <ul style={{ paddingLeft: "20px", margin: "0", color: "var(--vscode-foreground)", fontSize: "0.9em" }}>
                {features.map((feature, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>
                        {feature}
                    </li>
                ))}
            </ul>

            <div style={{ marginTop: "auto" }}>
                {isCurrent ? (
                    <VSCodeButton disabled style={{ width: "100%" }} appearance="secondary">
                        Active
                    </VSCodeButton>
                ) : (
                    <VSCodeButton
                        appearance={isDowngrade ? "secondary" : "primary"}
                        style={{ width: "100%" }}
                        disabled={loading}
                        onClick={() => (isDowngrade ? onDowngrade(planId) : onUpgrade(planId))}>
                        {isDowngrade ? "Downgrade" : "Upgrade"}
                    </VSCodeButton>
                )}
            </div>
        </div>
    )
}
