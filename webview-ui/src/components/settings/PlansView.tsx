import React, { useEffect, useState } from "react"
import { VSCodeButton, VSCodeProgressRing, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { AgenticaClient, SubscriptionResponse, UpgradeResponse } from "@/services/AgenticaClient"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { PlanCard } from "./PlanCard"
import { UsageStats } from "./UsageStats"
import { UpgradeModal } from "./UpgradeModal"

interface PlansViewProps {
    onDone: () => void
}

const PlansView: React.FC<PlansViewProps> = ({ onDone }) => {
    const { apiConfiguration } = useExtensionState()
    const [loading, setLoading] = useState(true)
    const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState<string>("")
    const [isDowngrade, setIsDowngrade] = useState(false)

    const client = new AgenticaClient(apiConfiguration?.agenticaPassword || "") // Using password as token based on user request format

    const fetchSubscription = async () => {
        setLoading(true)
        try {
            const data = await client.getSubscription()
            setSubscription(data)
        } catch (err: any) {
            console.error("Failed to fetch subscription", err)
            setError("Failed to load subscription data. Please check your network or login status.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubscription()
    }, [])

    const handleUpgradeClick = (planId: string) => {
        setSelectedPlanId(planId)
        setIsDowngrade(false)
        setUpgradeModalOpen(true)
    }

    const handleDowngradeClick = (planId: string) => {
        setSelectedPlanId(planId)
        setIsDowngrade(true)
        setUpgradeModalOpen(true)
    }

    const handleUpgradeSuccess = (data: UpgradeResponse) => {
        fetchSubscription()
        // Logic to show toast/notification could go here
    }

    if (loading && !subscription) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                <VSCodeProgressRing />
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: "20px", color: "var(--vscode-errorForeground)" }}>
                {error}
                <br />
                <VSCodeButton onClick={fetchSubscription} style={{ marginTop: "10px" }}>
                    Retry
                </VSCodeButton>
            </div>
        )
    }

    if (!subscription) return null

    const currentPlanId = subscription.data.plan_tier

    const plans = [
        { id: "free", price: "$0", period: "month", features: ["Basic Models", "200 req/day"] },
        { id: "plus", price: "$20", period: "month", features: ["Bonus Models", "$3.00/day Limit", "20k GenLabs Credits"] },
        { id: "pro", price: "$50", period: "month", features: ["Bonus Models", "$10.00/day Limit", "50k GenLabs Credits"] },
        { id: "max", price: "$200", period: "month", features: ["Bonus Models", "$30.00/day Limit", "200k GenLabs Credits"] },
    ]

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: "10px 0px 0px 20px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingRight: "17px",
                    marginBottom: "20px",
                }}>
                <h2 style={{ margin: 0 }}>Plans & Subscription</h2>
                <VSCodeButton appearance="icon" onClick={onDone}>
                    <span className="codicon codicon-close" />
                </VSCodeButton>
            </div>

            <div style={{ flex: 1, overflowY: "auto", paddingRight: "20px", paddingBottom: "20px" }}>
                <div style={{ marginBottom: "24px" }}>
                    <h3 style={{ marginBottom: "12px" }}>Usage & Limits</h3>
                    <UsageStats
                        dailyCreditsRemaining={subscription.data.daily_credits_remaining}
                        dailyLimit={subscription.limits.daily_credits}
                        dailyRequests={0} // Mocking as API doesn't return usage? API spec has limits daily_requests but not CURRENT usage.
                        dailyRequestsLimit={subscription.limits.daily_requests}
                        monthlyCostCredits={subscription.limits.monthly_cost_credits}
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            planId={plan.id as any}
                            currentPlanId={currentPlanId}
                            price={plan.price}
                            period={plan.period}
                            features={plan.features}
                            onUpgrade={handleUpgradeClick}
                            onDowngrade={handleDowngradeClick}
                            scheduledDowngrade={subscription.data.scheduled_downgrade_plan}
                        />
                    ))}
                </div>

                <div style={{ marginTop: "20px", fontSize: "0.9em", color: "var(--vscode-descriptionForeground)" }}>
                    <p>Subscription costs are deducted from your GenLabs Credits balance.</p>
                    {subscription.data.renewal_date && currentPlanId !== "free" && (
                        <p>Current plan renews on: {new Date(subscription.data.renewal_date).toLocaleDateString()}</p>
                    )}
                </div>
            </div>

            <UpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                planId={selectedPlanId}
                isDowngrade={isDowngrade}
                client={client}
                onSuccess={handleUpgradeSuccess}
            />
        </div>
    )
}

export default PlansView
