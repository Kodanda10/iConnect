## 2026-05-21 - Calendar Accessibility
**Learning:** Visual selection states on custom calendar controls need explicit ARIA attributes (like aria-pressed) since role="button" doesn't support aria-selected, and icon-only navigation needs aria-labels.
**Action:** Always pair visual "selected" classes with aria-pressed on custom button elements, and add aria-labels to icon-only next/prev controls.
