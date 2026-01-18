## 2025-02-20 - Form Validation UX
**Learning:** Aggressive inline validation (showing errors while typing) creates noise for screen readers and visual clutter for users.
**Action:** Always implement a "touched" state (via `onBlur`) before showing validation errors for incomplete fields. Keep immediate validation only for complete-but-invalid formats (e.g. length check met but invalid date).
