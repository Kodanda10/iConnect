## 2025-03-08 - Icon-only buttons lacking ARIA labels
**Learning:** Found that secondary top-nav actions (bell, logout) often rely purely on `title` or visual context without explicit `aria-label`s.
**Action:** Always verify icon-only buttons in the navigation have explicit `aria-label`s, as `title` is often insufficient for accessibility tools.
