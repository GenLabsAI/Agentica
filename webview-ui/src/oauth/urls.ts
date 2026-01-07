import { Package } from "@roo/package"

export function getCallbackUrl(provider: string, uriScheme?: string) {
	return encodeURIComponent(`${uriScheme || "vscode"}://${Package.publisher}.${Package.name}/${provider}`)
}

export function getGlamaAuthUrl(uriScheme?: string) {
	return `https://glama.ai/oauth/authorize?callback_url=${getCallbackUrl("glama", uriScheme)}`
}

export function getOpenRouterAuthUrl(uriScheme?: string) {
	return `https://openrouter.ai/auth?callback_url=${getCallbackUrl("openrouter", uriScheme)}`
}

export function getRequestyAuthUrl(uriScheme?: string) {
	return `https://app.requesty.ai/oauth/authorize?callback_url=${getCallbackUrl("requesty", uriScheme)}`
}

export function getAgenticaGithubAuthUrl(uriScheme?: string) {
	// Always use "vscode" scheme for GitHub OAuth callback since GitHub only allows one callback URL
	// This ensures compatibility with the registered callback URL in GitHub OAuth app settings
	const callbackUrl = getCallbackUrl("agentica", "vscode")
	// Use GenLabs auth endpoint which handles the GitHub OAuth redirect
	// The endpoint will redirect to GitHub OAuth and handle the callback
	return `https://api.genlabs.dev/auth/github?callback_url=${callbackUrl}`
}
