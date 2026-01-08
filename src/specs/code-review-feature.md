# Code Review Feature Specification

## Overview

This feature adds an automated code review capability that triggers after an agent completes a task in Code or Architect mode. When the user is logged into Agentica, a "Review with Deca" button appears, allowing them to get an AI-powered review of the agent's changes.

## Trigger Conditions

The review feature should activate when:
1. An agent task completes (detected by `ask === "completion_result"` in the last relevant message)
2. The agent was running in "Code" or "Architect" mode
3. The user is authenticated with Agentica (`cloudIsAuthenticated === true`)

## UI Implementation

### Review Button Location
- The "Review with Deca" button appears in TWO locations:
  1. In the TaskHeader component (when task is expanded)
  2. In the BottomControls at the bottom of the chat view (always visible when conditions met)
- Only show when all trigger conditions are met
- Position it prominently but not disruptively

### Button Styling
- Use VSCode button styling consistent with other action buttons
- Include appropriate icon (suggestion: code-review or check-circle icon)
- Text: "Review with Deca"

## Backend Implementation

### 1. Task Completion Detection
Location: `src/core/task/Task.ts` and `webview-ui/src/components/chat/TaskHeader.tsx`

Current detection logic:
```typescript
const isTaskComplete = clineMessages && clineMessages.length > 0
  ? (() => {
      const lastRelevantIndex = findLastIndex(
        clineMessages,
        (m) => !(m.ask === "resume_task" || m.ask === "resume_completed_task"),
      )
      return lastRelevantIndex !== -1
        ? clineMessages[lastRelevantIndex]?.ask === "completion_result"
        : false
    })()
  : false
```

### 2. Mode Detection
Location: `packages/types/src/mode.ts`

Target modes: "code" and "architect"
```typescript
const targetModes = ["code", "architect"]
const currentMode = visualMode // from useExtensionState
const isValidMode = targetModes.includes(currentMode)
```

### 3. Authentication Check
Location: `src/core/webview/ClineProvider.ts`

```typescript
const cloudIsAuthenticated = CloudService.hasInstance() && CloudService.instance.isAuthenticated()
```

### 4. File and Symbol Extraction Service

Create new service: `src/services/code-review/CodeReviewService.ts`

#### File List Extraction
- Use existing file tracking mechanisms
- Get list of files modified during the task
- Include file paths and basic metadata

#### Directory Tree Generation
- Generate workspace directory tree excluding .gitignore files
- Use tree structure to understand project dependencies and relationships
- Format as ASCII tree for LLM consumption

#### Unified Diff Generation
- Aggregate all changes made during the task
- Format as standard unified diff with file headers
- Include context lines for better understanding

### 5. Diff Generation

Use existing diff tracking: `src/core/diff/`

Generate unified diff showing:
- Files added/modified/deleted
- Line-by-line changes
- Context around changes

### 6. Minimax-M2 Integration

#### API Call Setup
- Use AgenticaClient for authenticated requests
- Target model: "MiniMax-M2" from minimax provider
- API endpoint: Integration through Agentica API

#### Prompt Structure
```
You are Deca, an expert code reviewer. Review the following code changes for quality, maintainability, and best practices.

## Files Changed
[Directory tree and unified diff]

## Code Changes (Diff)
[Unified diff of all changes]

## Review Guidelines
- Check for code quality and maintainability
- Check for tech debt
- Identify out of scope changes
- Identify potential bugs or issues
- Verify adherence to best practices
- Look for security concerns
- Assess performance implications
- Check for proper error handling

## Additional Context
- Mode used: [Code/Architect]
- Task description: [task.text]

If you need to see the full content of any file, use the <read_file> tool.
```

#### Agent Loop Implementation
The review process follows this specific flow:

1. **Context Provision**: Send directory tree and unified diff to LLM
2. **Intelligent Analysis**: LLM analyzes repository structure and changes to identify files needing deeper inspection
3. **File Selection**: LLM returns JSON array of files requiring detailed review
4. **Content Retrieval**: Provide full content of selected files
5. **Issue Identification**: LLM analyzes files and identifies specific issues
6. **JSON Output**: Return structured JSON array of problems

### New Flow Details
- **Step 1**: Provide directory tree and unified diff
- **Step 2**: LLM analyzes context and returns JSON array of files needing inspection
- **Step 3**: Provide full content of selected files
- **Step 4**: LLM identifies issues and returns JSON array of problems
- **Step 5**: Display issues with checkboxes for user selection

### 7. Review Result Display

#### UI Component
Create: `webview-ui/src/components/chat/CodeReviewDialog.tsx`

Features:
- Modal dialog showing review results
- Syntax-highlighted code blocks
- Expandable sections for different review categories
- Action buttons for accepting/rejecting suggestions

### Issue Selection Modal
- **Modal Display**: Shows all identified issues with checkboxes
- **Issue Details**: Each issue includes:
  - Title and description
  - Severity level (low/medium/high/critical)
  - Category (quality/bug/security/performance/maintainability)
  - File and line number
  - Suggested fix
- **Selection Controls**: Select All / Select None buttons
- **Fix Button**: Injects selected issues into chat input for fixing

### Issue Format
```json
[
  {
    "title": "Brief title of the issue",
    "description": "Detailed description of the problem",
    "severity": "low|medium|high|critical",
    "category": "quality|bug|security|performance|maintainability",
    "file": "relative/path/to/file.js",
    "line": 42,
    "suggestion": "How to fix this issue"
  }
]
```

### Chat Integration
- **Fix Button**: When clicked, formats selected issues and injects them into the chat input
- **Issue Formatting**: Creates readable list with issue details, suggestions, and file locations
- **Auto-focus**: Automatically focuses the chat input after injection
- **User Action**: User can then press Enter to start the fixing process with the agent

## Technical Implementation Details

### File Structure
```
src/
├── services/
│   └── code-review/
│       ├── CodeReviewService.ts
│       └── index.ts
└── specs/
    └── code-review-feature.md

webview-ui/src/
├── components/
│   ├── chat/
│   │   ├── CodeReviewDialog.tsx
│   │   ├── TaskHeader.tsx (updated)
│   │   └── ChatView.tsx (updated)
│   └── kilocode/
│       └── BottomControls.tsx (updated)
```

### Extension Message Types
Add to `src/shared/ExtensionMessage.ts`:
```typescript
export interface ExtensionMessageMap {
  // ... existing messages
  "startCodeReview": {
    taskId: string
    mode: string
    files: FileSymbols[]
    diff: string
  }
  "codeReviewResult": {
    review: CodeReviewResult
  }
  "requestFileContent": {
    filePath: string
  }
}
```

### Error Handling
- Handle authentication failures gracefully
- Show appropriate error messages for API failures
- Fallback behavior when services are unavailable

### Performance Considerations
- Cache directory tree generation results
- Limit file content requests to prevent abuse
- Implement timeout for long-running reviews

### Security Considerations
- Validate file paths to prevent directory traversal
- Sanitize diff output
- Ensure authentication checks are robust

## Testing Strategy

### Unit Tests
- CodeReviewService functionality
- Symbol extraction accuracy
- Diff generation correctness
- UI component behavior

### Integration Tests
- End-to-end review flow
- Authentication state handling
- Error condition handling

### Manual Testing Scenarios
1. Code mode task completion → Review button appears
2. Architect mode task completion → Review button appears
3. Non-authenticated user → No review button
4. Different file types → Symbol extraction works
5. Large codebases → Performance is acceptable
6. Agent loop → File content requests work

## Future Enhancements

### Phase 2 Features
- Inline review comments in editor
- Automated fix suggestions
- Integration with version control
- Team review workflows
- Custom review rulesets

### Metrics and Analytics
- Track review completion rates
- Measure review quality feedback
- Monitor API usage and costs
