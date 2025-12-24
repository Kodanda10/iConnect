---
trigger: always_on
---

# Conductor First (Workspace Rule)

**Every task in this workspace MUST use Conductor.**

## iConnect-Specific Workflow

1. **Track → Spec → Plan → Implement**
   - `/conductor:newTrack "Description of feature or bug"`
   - Review and approve spec.md
   - Review and approve plan.md
   - `/conductor:implement`

2. **TDD is Mandatory**
   - RED: Write failing test first
   - GREEN: Minimal code to pass
   - REFACTOR: Clean up

3. **Flutter Test Commands**
   - Run tests: `flutter test test/features/tasks/`
   - Single test: `flutter test test/path/to/test.dart`

## Code Standards

- Firestore fields: `snake_case`
- Dart variables: `camelCase`
- Sort all task lists: A-Z by constituent name
- Use `bloc_test` and `mocktail` for unit tests

## Endorlabs Security Scanning (MANDATORY)

**After every changelog update and task execution, run Endorlabs security scan:**

1. **Post-Changelog**: After updating the changelog, run security scan
2. **Post-Execution**: After completing any feature, debug, or refactor task
3. **Command**: `Scan my project for security vulnerabilities`

## Never Skip

- [ ] Conductor track for every change
- [ ] Failing test before code
- [ ] User approval before implementation
- [ ] All tests passing before completion
- [ ] Endorlabs security scan after changelog and task completion
