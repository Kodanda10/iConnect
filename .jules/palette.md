## 2026-07-01 - Adding accessibility attributes to custom toggle buttons
**Learning:** Icon-only toggles using Lucide icons lack inherent semantic meaning and state for screen readers. Using `role="switch"` paired with `aria-checked` effectively communicates the current state of a boolean setting to assistive technologies, turning a visual-only toggle into an accessible component.
**Action:** Always add `role="switch"`, `aria-checked`, and an appropriate `aria-label` when implementing custom switch/toggle buttons that rely on icons to indicate state.
