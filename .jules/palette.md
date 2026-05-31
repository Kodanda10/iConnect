## 2026-05-31 - Dynamic ARIA Labels for Dropdowns
**Learning:** Hardcoded aria-labels on dynamic elements like dropdowns replace the element's inner text in the accessibility tree, obscuring the current selection. Role button elements require aria-pressed instead of aria-selected.
**Action:** Use dynamic aria-labels that include both the action and current state, and use aria-pressed for interactive calendar buttons.
