# Palette's Journal - UX & Accessibility Learnings

This journal tracks critical UX patterns, accessibility insights, and design system decisions.

## 2024-05-22 - Password Visibility Toggle
**Learning:** Icon-only buttons (like eye/eye-off) MUST have dynamic `aria-label`s that reflect their current state ("Show password" vs "Hide password") to be accessible. Simply adding an icon is not enough for screen readers.
**Action:** Always pair stateful icon buttons with conditional `aria-label` logic and ensure `type="button"` to prevent accidental form submission.
