## 2025-02-18 - Accessibility in Custom Interactive Components
**Learning:** Custom interactive components (like date pickers) often rely on visual cues (text, icons) but miss semantic labels for screen readers. Specifically, `GlassCalendar` buttons were completely invisible to screen readers without `aria-label`.
**Action:** When creating or reviewing custom UI components, always verify:
1.  Icon-only buttons have `aria-label`.
2.  Dynamic grids (like calendars) have descriptive labels (e.g., "15 January 2024" instead of "15").
3.  State is communicated via ARIA attributes (`aria-expanded`, `aria-current`, `aria-pressed`).
