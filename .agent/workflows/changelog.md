---
description: How to maintain changelog and project history
---

# Changelog Workflow

## When to Use
This workflow MUST be followed for every:
- New feature request
- Bug fix
- Refactoring task
- Code review change

## Steps

### 1. Update Project DevOps Log (REQUIRED)
// turbo
Append to the SINGLE project history file at:
`/Users/abhijita/.gemini/antigravity/brain/[conversation-id]/PROJECT_DEVOPS_LOG.md`

Format:
```markdown
## [YYYY-MM-DD HH:MM IST] - [Task Title]
**Status**: [Planning/In Progress/Completed/Blocked]
**Files Modified**: [list of files]
**Summary**: [What was done]
**Next Steps**: [If any]
---
```

### 2. Add JSDoc Header to Modified Files (REQUIRED)
Every modified file MUST have/update this header:

```javascript
/**
 * @file [filename]
 * @description [Brief description]
 * 
 * @changelog
 * - [YYYY-MM-DD HH:MM IST] [Agent] - [Change description]
 */
```

### 3. Ask Questions Before Starting
Before any work:
- Ask clarifying questions until you have COMPLETE context
- Document answers in the task log
- Do NOT assume requirements

### 4. Data Flow Rules

#### Home Page: Gemma 3 ONLY
```
enriched_items.people → API people_mentioned → TweetTable
```

#### Review Page: Comparison Mode
```
parsed_events (Parser V2) vs enriched_items (Gemma 3)
```

## Verification
After completing work:
1. Check all modified files have changelog headers
2. Check PROJECT_DEVOPS_LOG.md is updated
3. Verify data flow matches the architecture