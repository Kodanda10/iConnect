## 2024-05-23 - Icon-only Button Accessibility
**Learning:** Found a recurring pattern in the design system where icon-only buttons (like modals closes, calendar controls) lacked both `aria-label` attributes for screen readers and visible focus indicators for keyboard users.
**Action:** Always add descriptive `aria-label` attributes to icon-only controls and ensure `focus-visible:ring-2 focus:outline-none` styles are applied for clear keyboard navigation feedback.
