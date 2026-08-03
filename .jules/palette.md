## 2025-12-17 - Missing ARIA labels and focus states on icon buttons
**Learning:** Glass-morphism layouts often strip out default button focus rings in favor of visual aesthetics, leading to poor keyboard accessibility, and icon-only buttons need explicit aria-labels for screen readers.
**Action:** Always add `aria-label` to icon-only buttons, and use `focus-visible:ring-2` to restore keyboard accessibility without impacting mouse users.
