## 2024-12-18 - Drag & Drop Keyboard Trap
**Learning:** Custom file upload drop zones using `div` with `onClick` create keyboard traps if not explicitly managed.
**Action:** Always add `role="button"`, `tabIndex={0}`, and `onKeyDown` (Enter/Space) handlers to interactive `div`s. Ensure focus indicators (`focus-visible`) are present.
