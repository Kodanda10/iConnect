## 2024-10-12 - Icon-only Button Accessibility
**Learning:** Found multiple instances of icon-only buttons (like notification bells, toggle switches, and calendar chevrons) missing `aria-label`s. This makes them invisible to screen readers, degrading the experience.
**Action:** Ensure all interactive elements that only use icons for visual representation have a descriptive `aria-label` attribute added.
