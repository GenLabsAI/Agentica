import axios from "axios"

export interface SubscriptionData {
    plan_tier: "free" | "plus" | "pro" | "max"
    daily_credits_remaining: number
    renewal_date: string
    scheduled_downgrade_plan?: "free" | "plus" | "pro" | "max"
}

export interface SubscriptionLimits {
    daily_credits: number
    daily_requests: number
    allow_premium: boolean
    monthly_cost_credits: number
}

export interface SubscriptionResponse {
    data: SubscriptionData
    limits: SubscriptionLimits
}

export interface UpgradeResponse {
    message: string
    plan?: string
    renewal_date?: string
    refunded_credits?: number
    charged_credits?: number
    downgrade_date?: string
    status?: "scheduled" | "active"
}

export class AgenticaClient {
    private baseUrl: string
    private token: string

    constructor(token: string, baseUrl?: string) {
        this.token = token
        this.baseUrl = baseUrl || "https://api.genlabs.dev/agentica/v1"
    }

    private getHeaders() {
        return {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
        }
    }

    async getSubscription(): Promise<SubscriptionResponse> {
        const response = await axios.get(`${this.baseUrl}/subscription`, {
            headers: this.getHeaders(),
        })
        return response.data
    }

    async upgradeSubscription(plan: string, billingCycle: "monthly" | "yearly" = "monthly"): Promise<UpgradeResponse> {
        const response = await axios.post(
            `${this.baseUrl}/subscription/upgrade`,
            {
                plan,
                billing_cycle: billingCycle,
            },
            {
                headers: this.getHeaders(),
            },
        )
        return response.data
    }
}
