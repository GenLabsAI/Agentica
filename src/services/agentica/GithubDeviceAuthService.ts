import EventEmitter from "events"
import axios from "axios"

const POLL_INTERVAL_MS = 5000 // GitHub recommends polling every 5 seconds
const GITHUB_DEVICE_CODE_URL = "https://github.com/login/device/code"
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"

export interface GithubDeviceAuthResponse {
	device_code: string
	user_code: string
	verification_uri: string
	expires_in: number
	interval: number
}

export interface GithubTokenResponse {
	access_token: string
	token_type: string
	scope?: string
}

export interface DeviceAuthServiceEvents {
	started: [data: { userCode: string; verificationUrl: string; expiresIn: number }]
	polling: [timeRemaining: number]
	success: [accessToken: string]
	denied: []
	expired: []
	error: [error: Error]
	cancelled: []
}

/**
 * Service for handling GitHub device authorization flow for Agentica
 */
export class GithubDeviceAuthService extends EventEmitter<DeviceAuthServiceEvents> {
	private pollIntervalId?: NodeJS.Timeout
	private startTime?: number
	private expiresIn?: number
	private deviceCode?: string
	private pollInterval?: number
	private aborted = false
	private clientId: string

	// Agentica GitHub OAuth Client ID
	private static readonly DEFAULT_CLIENT_ID = "Ov23lioKGgXQS2BOFDWO"

	constructor(clientId?: string) {
		super()
		this.clientId = clientId || GithubDeviceAuthService.DEFAULT_CLIENT_ID
	}

	/**
	 * Initiate GitHub device authorization flow
	 * @returns Device authorization details
	 * @throws Error if initiation fails
	 */
	async initiate(): Promise<{ userCode: string; verificationUrl: string; expiresIn: number }> {
		try {
			const response = await axios.post<GithubDeviceAuthResponse>(
				GITHUB_DEVICE_CODE_URL,
				{
					client_id: this.clientId,
					scope: "user:email",
				},
				{
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				},
			)

			const data = response.data
			this.deviceCode = data.device_code
			this.expiresIn = data.expires_in
			this.pollInterval = data.interval * 1000 // Convert to milliseconds
			this.startTime = Date.now()
			this.aborted = false

			const authData = {
				userCode: data.user_code,
				verificationUrl: data.verification_uri,
				expiresIn: data.expires_in,
			}

			this.emit("started", authData)

			// Start polling
			this.startPolling()

			return authData
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error))
			this.emit("error", err)
			throw err
		}
	}

	/**
	 * Poll for device authorization status
	 */
	private async poll(): Promise<void> {
		if (!this.deviceCode || this.aborted) {
			return
		}

		try {
			const response = await axios.post<GithubTokenResponse>(
				GITHUB_TOKEN_URL,
				{
					client_id: this.clientId,
					device_code: this.deviceCode,
					grant_type: "urn:ietf:params:oauth:grant-type:device_code",
				},
				{
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				},
			)

			if (response.data.access_token) {
				// Success - user has authorized
				this.stopPolling()
				this.emit("success", response.data.access_token)
				return
			}
		} catch (error: any) {
			if (error.response) {
				const errorType = error.response.data?.error

				if (errorType === "authorization_pending") {
					// Still pending - emit time remaining
					if (this.startTime && this.expiresIn) {
						const elapsed = Date.now() - this.startTime
						const timeRemaining = Math.max(0, this.expiresIn * 1000 - elapsed)
						this.emit("polling", timeRemaining)
					}
					return
				}

				if (errorType === "slow_down") {
					// GitHub is asking us to slow down - increase poll interval
					if (this.pollInterval) {
						this.pollInterval = Math.min(this.pollInterval * 1.5, 60000) // Max 60 seconds
					}
					return
				}

				if (errorType === "expired_token") {
					this.stopPolling()
					this.emit("expired")
					return
				}

				if (errorType === "access_denied") {
					this.stopPolling()
					this.emit("denied")
					return
				}
			}

			// Other errors
			const err = error instanceof Error ? error : new Error(String(error))
			this.emit("error", err)
		}
	}

	/**
	 * Start polling for authorization
	 */
	private startPolling(): void {
		if (this.pollIntervalId) {
			clearInterval(this.pollIntervalId)
		}

		// Poll immediately
		this.poll()

		// Then poll at the specified interval
		const interval = this.pollInterval || POLL_INTERVAL_MS
		this.pollIntervalId = setInterval(() => {
			this.poll()
		}, interval)
	}

	/**
	 * Stop polling
	 */
	private stopPolling(): void {
		if (this.pollIntervalId) {
			clearInterval(this.pollIntervalId)
			this.pollIntervalId = undefined
		}
	}

	/**
	 * Cancel the device auth flow
	 */
	cancel(): void {
		this.aborted = true
		this.stopPolling()
		this.emit("cancelled")
	}

	/**
	 * Dispose of the service
	 */
	dispose(): void {
		this.cancel()
		this.removeAllListeners()
	}
}

