## 2025-02-21 - Custom UI Component Accessibility
**Learning:** Custom components like `GlassCalendar` often rely on visual cues (icons, layout) and miss semantic structure. Specifically, icon-only navigation buttons lacked accessible names, and custom dropdowns lacked `role="listbox"` and `aria-expanded` states.
**Action:** When auditing custom UI components, always check for:
1. `aria-label` on icon-only buttons.
2. `role="listbox"`/`option` on custom dropdowns.
3. Full context in labels (e.g., "15 January 2024" instead of "15").
