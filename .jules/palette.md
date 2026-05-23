## 2026-05-23 - Dynamic ARIA labels for Dropdowns
**Learning:** When adding `aria-label` attributes to elements that display dynamic content (like a dropdown showing the currently selected month or year), hardcoded labels completely replace the element's inner text in the accessibility tree and obscure the current selection for screen readers.
**Action:** Use a dynamic `aria-label` that includes both the action and the current state (e.g., `aria-label={"Select month, currently " + currentValue}`).
