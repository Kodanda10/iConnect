## 2024-05-22 - Calendar Accessibility
**Learning:** Calendars are notoriously difficult for screen readers without explicit ARIA labels. Icon-only buttons (prev/next) and day numbers ("15") are meaningless or ambiguous without context.
**Action:** Always add `aria-label` to navigation buttons (e.g., "Previous month") and full date strings to day cells (e.g., "15 January 2024"). Add `aria-current="date"` for the current day to differentiate it semantically, not just visually.
