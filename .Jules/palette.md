## 2026-02-12 - Invisible Interactive Elements
**Learning:** Elements using `opacity-0` for hover effects (like delete buttons) are invisible to keyboard users even when focused.
**Action:** Always add `focus:opacity-100` alongside `group-hover:opacity-100` to ensure keyboard accessibility.
