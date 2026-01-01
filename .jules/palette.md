# Palette Journal
## 2024-05-23 - GlassCalendar Accessibility
**Learning:** The 'aria-selected' attribute is invalid for elements with 'role=button'. For date pickers using buttons, use 'aria-label' to explicitly state 'selected' status (e.g., '15 January 2024, selected') instead of relying on the attribute.
**Action:** When implementing grid-based selection on buttons, verify role compatibility or use aria-label text for state.
