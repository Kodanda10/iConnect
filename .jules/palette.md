## 2026-05-29 - Dynamic ARIA Labels in Calendars
**Learning:** Hardcoded aria-labels on dropdown triggers (like 'Select month') override the element's inner text, completely hiding the currently selected value from screen readers. Also, 'aria-pressed' should be used for calendar day buttons instead of 'aria-selected' when using standard button roles.
**Action:** Use dynamic aria-labels that combine the action and current state (e.g., 'Select month, currently Jan') and use 'aria-pressed' for standard button selection states.
