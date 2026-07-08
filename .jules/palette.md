## 2026-07-08 - Keyboard Accessibility for Hover-based Visualizations
**Learning:** Hover-based data visualizations exclude keyboard and screen reader users unless explicitly handled.
**Action:** Always add `tabIndex={0}`, `role="button"`, `onFocus`, `onBlur`, keyboard event listeners, and `focus-visible` outlines to hover targets, and ensure the dynamic content container uses `aria-live="polite"` to announce changes.
