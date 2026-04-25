
## 2026-04-25 - Custom Calendar Accessibility
**Learning:** Interactive calendar components require explicit ARIA attributes (roles, aria-haspopup, aria-expanded, aria-current, aria-pressed) and full date strings in labels because screen readers cannot interpret visual styling or grid layout context.
**Action:** Always add semantic ARIA state attributes alongside visual selection classes in custom interactive UI controls.
