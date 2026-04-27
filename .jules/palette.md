## 2024-04-27 - Calendar Component Accessibility
**Learning:** Custom interactive UI controls like calendars and dropdowns require explicit ARIA state attributes (`aria-pressed`, `aria-selected`, `aria-current`) alongside visual states. `role="button"` does not support `aria-selected`, so `aria-pressed` must be used for selected dates.
**Action:** Always pair visual selection styles (like Tailwind background classes) with semantic ARIA state attributes to ensure screen reader compatibility.
