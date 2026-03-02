export const PLAN_LIMITS = {
    free: {
        daily_credits: 0.0,
        daily_requests: 100,
        allow_premium: false,
        monthly_cost_credits: 0,
        yearly_cost_credits: 0,
    },
    plus: {
        daily_credits: 1.0,
        daily_requests: 999999,
        allow_premium: true,
        monthly_cost_credits: 15000, // $20/month
        yearly_cost_credits: 14000 * 12, // $19/month * 12 = $228/year
    },
    pro: {
        daily_credits: 4.0,
        daily_requests: 999999,
        allow_premium: true,
        monthly_cost_credits: 50000, // $50/month
        yearly_cost_credits: 40000 * 12, // $40/month * 12 = $480/year
    },
    max: {
        daily_credits: 10.0,
        daily_requests: 999999,
        allow_premium: true,
        monthly_cost_credits: 200000, // $200/month
        yearly_cost_credits: 180000 * 12, // $180/month * 12 = $1800/year
    },
} as const;