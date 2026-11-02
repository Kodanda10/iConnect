## 2025-03-09 - Added ARIA Labels to Modal Close Buttons
**Learning:** Icon-only buttons (like `X` for closing modals) were lacking semantic ARIA labels in the generic CRM layout, creating an accessibility block for screen readers.
**Action:** Consistently add `aria-label="Close"` to all icon-only modal dismissal buttons across layout components (e.g., `StaffPortal`, `LeaderApp`).
