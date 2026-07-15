## 2025-12-22 - Missing focus states and ARIA labels on layout icons
**Learning:** Icon-only utility buttons in layout headers (like notifications or sign-out) frequently miss `aria-label` attributes and keyboard focus indicators, making primary navigation actions inaccessible to screen reader and keyboard users.
**Action:** Always verify that layout-level utility icons have both `aria-label`s and explicit `focus-visible` ring styling applied.
