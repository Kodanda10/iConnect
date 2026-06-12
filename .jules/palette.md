## 2026-06-12 - Dynamic ARIA Labels for Calendar Navigation
**Learning:** Hardcoding static `aria-label`s on dynamic navigational elements (like calendar month switchers) degrades the screen reader experience because users lose context of their current state.
**Action:** Always interpolate the current or target state into the `aria-label` (e.g., `aria-label={"Previous month, currently " + currentValue}`) for navigation controls that shift dynamically.
