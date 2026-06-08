## 2026-06-08 - Dynamic ARIA labels for Calendar Controls
**Learning:** Hardcoded ARIA labels on dynamic elements completely obscure the element's current state for screen readers.
**Action:** Always provide a dynamic aria-label on interactive components that include both the action and current state (e.g., aria-label={"Select month, currently " + currentValue}).
