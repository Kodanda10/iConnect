## 2024-12-18 - Drag & Drop Keyboard Accessibility
**Learning:** Custom drag & drop zones often rely solely on mouse interactions (`onDrop`, `onClick`), excluding keyboard users.
**Action:** Always add `role="button"`, `tabIndex={0}`, and `onKeyDown` (handling Enter/Space) to non-button interactive elements like drop zones, and ensure a hidden file input can be triggered programmatically.
