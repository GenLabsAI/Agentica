import React, { useState } from "react"
import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react"
import { AgenticaClient, UpgradeResponse } from "@/services/AgenticaClient"

interface UpgradeModalProps {
    isOpen: boolean
    onClose: () => void
    planId: string
    isDowngrade: boolean
    client: AgenticaClient
    onSuccess: (data: UpgradeResponse) => void
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, planId, isDowngrade, client, onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleConfirm = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await client.upgradeSubscription(planId)
            onSuccess(result)
            onClose()
        } catch (err: any) {
            console.error("Upgrade failed", err)
            setError(err.response?.data?.message || err.message || "Failed to upgrade subscription")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}>
            <div
                style={{
                    background: "var(--vscode-editor-background)",
                    border: "1px solid var(--vscode-widget-border)",
                    borderRadius: "8px",
                    padding: "24px",
                    width: "400px",
                    maxWidth: "90%",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                }}>
                <h2 style={{ margin: 0, fontSize: "1.5em" }}>
                    {isDowngrade ? "Confirm Downgrade" : `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)}`}
                </h2>

                {isDowngrade ? (
                    <p>
                        Your plan will switch to <strong>{planId}</strong> at the end of your current billing cycle. You will
                        retain your current benefits until then.
                    </p>
                ) : (
                    <div
                        style={{
                            background: "var(--vscode-inputValidation-warningBackground)",
                            border: "1px solid var(--vscode-inputValidation-warningBorder)",
                            padding: "12px",
                            borderRadius: "4px",
                        }}>
                        <strong>Important:</strong> Cost will be deducted from your GenLabs Balance.
                    </div>
                )}

                {error && (
                    <div
                        style={{
                            color: "var(--vscode-errorForeground)",
                            background: "rgba(255, 0, 0, 0.1)",
                            padding: "8px",
                            borderRadius: "4px",
                        }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    <VSCodeButton appearance="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </VSCodeButton>
                    <VSCodeButton onClick={handleConfirm} disabled={loading}>
                        {loading ? <VSCodeProgressRing style={{ height: "16px" }} /> : "Confirm"}
                    </VSCodeButton>
                </div>
            </div>
        </div>
    )
}
