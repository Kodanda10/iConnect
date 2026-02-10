## 2024-05-22 - Interactive Divs without Keyboard Support
**Learning:** The application uses `div` elements for custom interactive zones (like drag-and-drop file upload) but forgets to add keyboard accessibility attributes (`role`, `tabIndex`, `onKeyDown`).
**Action:** Always check `onClick` handlers on `div` elements and ensure they have corresponding `onKeyDown` handlers and `role="button"` (or similar) to make them accessible to keyboard users.
