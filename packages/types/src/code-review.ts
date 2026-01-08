// Code Review Types
export interface CodeReviewIssue {
	title: string
	description: string
	severity: 'low' | 'medium' | 'high' | 'critical'
	category: string
	file?: string
	line?: number
	suggestion?: string
}

export interface CodeReviewResult {
	strengths: string[]
	issues: CodeReviewIssue[]
	improvements: Array<{
		category: string
		description: string
		suggestion: string
	}>
	documentation: Array<{
		type: 'missing' | 'inadequate' | 'outdated'
		description: string
		suggestion: string
	}>
	testing: Array<{
		type: 'unit' | 'integration' | 'e2e'
		description: string
		suggestion: string
	}>
	summary: string
}
