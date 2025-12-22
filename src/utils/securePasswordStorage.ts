import { setPassword, getPassword, deletePassword } from 'keytar'

/**
 * Secure password storage using keytar
 * This provides OS-level secure storage for passwords
 */

export class SecurePasswordStorage {
	private static readonly SERVICE_NAME = 'agentica'
	private static readonly ACCOUNT_NAME = 'agentica_password'

	/**
	 * Store password securely using keytar
	 * @param password - The password to store
	 */
	static async storePassword(password: string): Promise<void> {
		try {
			await setPassword(this.SERVICE_NAME, this.ACCOUNT_NAME, password)
		} catch (error) {
			console.error('Failed to store password securely:', error)
			throw new Error('Failed to store password securely')
		}
	}

	/**
	 * Retrieve password from secure storage
	 * @returns The stored password or null if not found
	 */
	static async getPassword(): Promise<string | null> {
		try {
			return await getPassword(this.SERVICE_NAME, this.ACCOUNT_NAME)
		} catch (error) {
			console.error('Failed to retrieve password from secure storage:', error)
			return null
		}
	}

	/**
	 * Clear password from secure storage
	 */
	static async clearPassword(): Promise<void> {
		try {
			await deletePassword(this.SERVICE_NAME, this.ACCOUNT_NAME)
		} catch (error) {
			console.error('Failed to clear password from secure storage:', error)
		}
	}

	/**
	 * Check if password is stored
	 * @returns true if password is stored, false otherwise
	 */
	static async hasPassword(): Promise<boolean> {
		try {
			const password = await this.getPassword()
			return password !== null
		} catch (error) {
			console.error('Failed to check password status:', error)
			return false
		}
	}

	/**
	 * Store multiple passwords for different services
	 * @param serviceName - The service name (e.g., 'agentica', 'openai')
	 * @param accountName - The account name
	 * @param password - The password to store
	 */
	static async storePasswordForService(serviceName: string, accountName: string, password: string): Promise<void> {
		try {
			await setPassword(serviceName, accountName, password)
		} catch (error) {
			console.error(`Failed to store password for ${serviceName}/${accountName}:`, error)
			throw new Error(`Failed to store password for ${serviceName}/${accountName}`)
		}
	}

	/**
	 * Retrieve password for a specific service
	 * @param serviceName - The service name
	 * @param accountName - The account name
	 * @returns The stored password or null if not found
	 */
	static async getPasswordForService(serviceName: string, accountName: string): Promise<string | null> {
		try {
			return await getPassword(serviceName, accountName)
		} catch (error) {
			console.error(`Failed to retrieve password for ${serviceName}/${accountName}:`, error)
			return null
		}
	}

	/**
	 * Clear password for a specific service
	 * @param serviceName - The service name
	 * @param accountName - The account name
	 */
	static async clearPasswordForService(serviceName: string, accountName: string): Promise<void> {
		try {
			await deletePassword(serviceName, accountName)
		} catch (error) {
			console.error(`Failed to clear password for ${serviceName}/${accountName}:`, error)
		}
	}

	/**
	 * List all stored credentials (service names and account names)
	 * Note: This is a simplified version as keytar doesn't provide a direct way to list credentials
	 * In a real implementation, you might want to maintain an index of stored credentials
	 */
	static async listCredentials(): Promise<Array<{ service: string; account: string }>> {
		// This is a placeholder implementation
		// In a real implementation, you would need to maintain your own index
		// or use platform-specific APIs to enumerate stored credentials
		return []
	}
}