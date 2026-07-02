## 2026-07-02 - Glass Calendar Accessibility
**Learning:** Glassmorphic navigation components often lack proper ARIA labels and visible focus rings because their visual style relies heavily on hover states and opacity. Keyboard users can easily lose track of focus.
**Action:** Always add `aria-label` to icon-only navigation buttons and use `focus-visible:ring-2` for keyboard navigation in custom components.
