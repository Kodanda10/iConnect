## 2026-06-07 - Dynamic ARIA labels for stateful dropdowns
**Learning:** When an element displays dynamic content (like a selected month/year), using a hardcoded `aria-label` (e.g. "Select month") replaces the inner text and hides the current selection from screen readers.
**Action:** Use a dynamic `aria-label` that includes both the action and current state (e.g. `aria-label={"Select month, currently " + currentValue}`).
