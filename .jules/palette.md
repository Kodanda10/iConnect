## 2026-06-04 - Dynamic ARIA Labels in Calendars
**Learning:** Using hardcoded labels on dynamic dropdowns obscures current selection for screen readers. Using aria-pressed is required over aria-selected for role="button" elements.
**Action:** Always combine the action and current state (e.g., "Select month, currently Jan") for dynamic dropdown aria-labels, and use aria-pressed for interactive grid day buttons.
