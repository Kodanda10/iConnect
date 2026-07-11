## 2025-02-27 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found a recurring pattern in the React components (e.g., LeaderApp and StaffPortal) where icon-only buttons (like close dialog buttons and calendar navigation) lack `aria-label`s, rendering them inaccessible to screen readers.
**Action:** Always add descriptive `aria-label` attributes to any button that relies solely on an icon for its visual meaning to ensure keyboard and screen reader accessibility.
