## 2025-02-23 - ARIA Selection on Buttons
**Learning:** The `button` role does not support `aria-selected` (supported by `gridcell`, `option`, `tab`, etc.). For interactive selection grids using buttons (like calendars), avoid `aria-selected` directly on the button unless the role is overridden.
**Action:** Use `aria-pressed` for toggle buttons or append status to `aria-label` (e.g., "January 1, selected") for selection state on standard buttons, or wrap in `gridcell` with `aria-selected`.
