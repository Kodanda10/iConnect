# Palette's Journal

## 2024-05-23 - Accessible Calendar Grid
**Learning:** For calendar components, screen readers announce day buttons as just numbers ("1", "2") unless an `aria-label` is provided with the full date context (e.g., "15 January 2024"). Navigation buttons (prev/next) using icons also become invisible without labels.
**Action:** Always construct a full date string for calendar day buttons and use it in `aria-label`. Use `aria-current="date"` for today's date.
