## 2024-12-19 - Accessible Header Interactions
**Learning:** Icon-only utility buttons in global headers (like notifications or profile actions) are completely inaccessible to screen readers without ARIA labels, and keyboard users lose their place without clear `:focus-visible` outlines against complex backgrounds.
**Action:** Always pair `aria-label` with `focus-visible:ring-2` (and appropriate ring colors, e.g., `focus-visible:ring-red-400/50` for destructive actions) on all icon-only interactive elements in navigation components.
