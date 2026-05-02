## 2024-05-02 - Custom Calendar Accessibility
**Learning:** Custom calendar components using button elements require specific ARIA attributes (`aria-pressed` for selection instead of `aria-selected`, `aria-current="date"` for today) to correctly expose visual states to screen readers.
**Action:** Always apply explicit ARIA state attributes alongside visual Tailwind selection classes for interactive UI controls.
