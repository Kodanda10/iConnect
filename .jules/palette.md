## 2026-06-09 - Dynamic aria-labels for dropdowns
**Learning:** Hardcoded labels on elements displaying dynamic state replace the inner text in the accessibility tree, hiding the current state from screen readers.
**Action:** Use dynamic aria-labels that include both the action and the current state, e.g., aria-label={"Select month, currently " + currentValue}.
