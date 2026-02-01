## 2025-02-24 - GlassCalendar Accessibility
**Learning:** For custom calendar components using `button` elements as grid cells, avoid `aria-selected` as it is not valid on `role="button"`. Instead, use `aria-current="date"` for today and update `aria-label` to include state information (e.g., "Selected: 15 January 2024").
**Action:** When auditing interactive grids, verify role validity before applying state attributes. Use explicit label prefixes for selection states on standard buttons.
