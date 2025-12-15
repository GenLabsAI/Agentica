import React, { useState } from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { Trans, useTranslation } from "react-i18next"
import { CheckCircle, AlertTriangle, Wrench, BookOpen, TestTube, X, Loader2 } from "lucide-react"

import { vscode } from "@src/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { Modal } from "@src/components/common/Modal"
import CodeBlock from "@src/components/common/CodeBlock"

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

interface CodeReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
  review?: CodeReviewResult
  error?: string
  onStartReview: () => void
  onFixIssues?: (selectedIssues: CodeReviewIssue[]) => void
}

const severityColors = {
  low: 'text-yellow-600',
  medium: 'text-orange-600',
  high: 'text-red-600',
  critical: 'text-red-800'
}

const severityIcons = {
  low: '⚠️',
  medium: '🟡',
  high: '🔴',
  critical: '🚨'
}

export const CodeReviewDialog: React.FC<CodeReviewDialogProps> = ({
  isOpen,
  onClose,
  isLoading = false,
  review,
  error,
  onStartReview,
  onFixIssues
}) => {
  const { t } = useAppTranslation()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set())

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const toggleIssueSelection = (issueIndex: number) => {
    const newSelected = new Set(selectedIssues)
    if (newSelected.has(issueIndex)) {
      newSelected.delete(issueIndex)
    } else {
      newSelected.add(issueIndex)
    }
    setSelectedIssues(newSelected)
  }

  const handleFixIssues = () => {
    if (!review || !onFixIssues) return

    const selectedIssueObjects = review.issues.filter((_, index) => selectedIssues.has(index))
    onFixIssues(selectedIssueObjects)
    onClose()
  }

  const selectAllIssues = () => {
    if (!review) return
    setSelectedIssues(new Set(review.issues.map((_, index) => index)))
  }

  const selectNoneIssues = () => {
    setSelectedIssues(new Set())
  }

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    items: any[],
    renderItem: (item: any, index: number) => React.ReactNode,
    emptyMessage: string
  ) => {
    const sectionId = title.toLowerCase().replace(/\s+/g, '-')
    const isExpanded = expandedSections.has(sectionId)

    return (
      <div className="border border-vscode-input-border rounded-md mb-4">
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-vscode-input-background/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-semibold">{title}</span>
            {items.length > 0 && (
              <span className="bg-vscode-badge-background text-vscode-badge-foreground px-2 py-1 rounded-full text-xs">
                {items.length}
              </span>
            )}
          </div>
          <span className={`codicon codicon-chevron-${isExpanded ? 'down' : 'right'} text-vscode-descriptionForeground`} />
        </button>

        {isExpanded && (
          <div className="px-3 pb-3">
            {items.length === 0 ? (
              <p className="text-vscode-descriptionForeground italic">{emptyMessage}</p>
            ) : (
              <div className="space-y-3">
                {items.map(renderItem)}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl max-h-[80vh] overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-vscode-panel-border">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-vscode-foreground">
              {t("chat:codeReview.title", { defaultValue: "Code Review with Deca" })}
            </h2>
          </div>
          <VSCodeButton appearance="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </VSCodeButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-vscode-progressBar-background" />
                <span className="text-vscode-descriptionForeground">
                  {t("chat:codeReview.loading", { defaultValue: "Analyzing code changes..." })}
                </span>
              </div>
            </div>
          )}

          {!isLoading && !review && !error && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-vscode-descriptionForeground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-vscode-foreground mb-2">
                {t("chat:codeReview.ready", { defaultValue: "Ready for Review" })}
              </h3>
              <p className="text-vscode-descriptionForeground mb-6">
                {t("chat:codeReview.description", { defaultValue: "Get an AI-powered review of the code changes made during this task." })}
              </p>
              <VSCodeButton onClick={onStartReview}>
                {t("chat:codeReview.start", { defaultValue: "Start Code Review" })}
              </VSCodeButton>
            </div>
          )}

          {review && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
                <p className="text-blue-800">{review.summary}</p>
              </div>

              {/* Strengths */}
              {renderSection(
                "Strengths",
                <CheckCircle className="w-5 h-5 text-green-600" />,
                review.strengths,
                (strength, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-800">{strength}</span>
                  </div>
                ),
                "No particular strengths identified."
              )}

              {/* Issues Found */}
              <div className="border border-vscode-input-border rounded-md mb-4">
                <div className="flex items-center justify-between p-3 border-b border-vscode-input-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold">Issues Found ({review.issues.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAllIssues}
                      className="text-xs text-vscode-textLink-foreground hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-vscode-descriptionForeground">|</span>
                    <button
                      onClick={selectNoneIssues}
                      className="text-xs text-vscode-textLink-foreground hover:underline"
                    >
                      Select None
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  {review.issues.length === 0 ? (
                    <p className="text-vscode-descriptionForeground italic">No issues found.</p>
                  ) : (
                    <div className="space-y-3">
                      {review.issues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedIssues.has(index)}
                            onChange={() => toggleIssueSelection(index)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-mono text-red-600">
                                {severityIcons[issue.severity]} {issue.severity.toUpperCase()}
                              </span>
                              <span className="text-sm text-vscode-descriptionForeground">
                                {issue.category}
                              </span>
                              <span className="text-sm font-semibold text-vscode-foreground">
                                {issue.title}
                              </span>
                            </div>
                            <p className="text-vscode-foreground mb-2 text-sm">{issue.description}</p>
                            {issue.suggestion && (
                              <div className="bg-white p-2 rounded text-sm border">
                                <strong>Suggestion:</strong> {issue.suggestion}
                              </div>
                            )}
                            {issue.file && (
                              <div className="text-xs text-vscode-descriptionForeground mt-1">
                                {issue.file}{issue.line ? `:${issue.line}` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Improvements */}
              {renderSection(
                "Improvements",
                <Wrench className="w-5 h-5 text-blue-600" />,
                review.improvements,
                (improvement, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-900 mb-1">{improvement.category}</div>
                    <p className="text-blue-800 mb-2">{improvement.description}</p>
                    <div className="bg-white p-2 rounded text-sm border">
                      <strong>Suggestion:</strong> {improvement.suggestion}
                    </div>
                  </div>
                ),
                "No improvement suggestions."
              )}

              {/* Documentation */}
              {renderSection(
                "Documentation",
                <BookOpen className="w-5 h-5 text-purple-600" />,
                review.documentation,
                (doc, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-purple-600">
                        {doc.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-purple-800 mb-2">{doc.description}</p>
                    <div className="bg-white p-2 rounded text-sm border">
                      <strong>Suggestion:</strong> {doc.suggestion}
                    </div>
                  </div>
                ),
                "Documentation looks good."
              )}

              {/* Testing */}
              {renderSection(
                "Testing",
                <TestTube className="w-5 h-5 text-orange-600" />,
                review.testing,
                (test, index) => (
                  <div key={index} className="p-3 bg-orange-50 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-orange-600">
                        {test.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-orange-800 mb-2">{test.description}</p>
                    <div className="bg-white p-2 rounded text-sm border">
                      <strong>Suggestion:</strong> {test.suggestion}
                    </div>
                  </div>
                ),
                "Testing coverage appears adequate."
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {review && (
          <div className="flex justify-between items-center p-4 border-t border-vscode-panel-border">
            <div className="text-sm text-vscode-descriptionForeground">
              {selectedIssues.size > 0 && `${selectedIssues.size} issue${selectedIssues.size === 1 ? '' : 's'} selected`}
            </div>
            <div className="flex gap-2">
              <VSCodeButton appearance="secondary" onClick={onClose}>
                {t("common:close", { defaultValue: "Close" })}
              </VSCodeButton>
              {selectedIssues.size > 0 && onFixIssues && (
                <VSCodeButton appearance="primary" onClick={handleFixIssues}>
                  {t("chat:codeReview.fixButton", { defaultValue: "Fix Issues" })}
                </VSCodeButton>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
