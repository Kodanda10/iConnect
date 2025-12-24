---
description: Conductor First - The master workflow for all tasks. Every new feature, testing, debugging, and refactoring must start with this workflow.
---

# Conductor First Protocol

**The Iron Rule: Conductor First + Endorlabs Security**

For EVERY task assigned to you — new feature, testing, debugging, or refactoring — you MUST follow this workflow before writing any production code.

## Phase 1: Track Setup

1. Create/update `task.md` in the artifacts directory with:
   - [ ] Clear task breakdown as checklist
   - [ ] Mark items as `[ ]` (pending), `[/]` (in progress), `[x]` (done)

2. Create/update `implementation_plan.md` with:
   - [ ] Problem context and goal
   - [ ] Proposed changes (files to modify/create)
   - [ ] Verification plan (tests to write/run)

3. Request user approval via `notify_user` before proceeding

## Phase 2: TDD Execution

Follow `/tdd` workflow strictly:
1. **RED**: Write failing test first
2. **VERIFY RED**: Run test, confirm it fails for the right reason
3. **GREEN**: Write minimal code to pass
4. **VERIFY GREEN**: Run test, confirm it passes
5. **REFACTOR**: Clean up while keeping tests green

## Phase 3: Verification

1. Run all existing tests to ensure no regressions
2. Perform manual verification as per the plan
3. Update `walkthrough.md` with proof of work

## Phase 4: Security Scan (MANDATORY)

**Run Endorlabs security scan after every changelog and task completion:**

```
Scan my project for security vulnerabilities
```

This step is NEVER optional. Complete it after:
- Every changelog update
- Every feature, bug fix, debug, or refactor completion

## Global Rules

- **Conductor First**: Never skip this workflow
- **TDD Strict**: No production code without a failing test
- **User Approval**: Always get plan approval before execution
- **Documentation**: Keep task.md and artifacts updated throughout
- **Endorlabs Security**: Run security scan after every changelog and task execution

## Workspace Rule (Applied Globally)

When working in any workspace:
1. Check for existing tests before adding new functionality
2. Follow project's testing conventions
3. Sort all list outputs alphabetically for consistency
4. Use snake_case for Firestore fields, camelCase for Dart variables
5. Run Endorlabs security scan before considering any task complete
