## 2025-01-20 - Added ARIA labels and focus states to Calendar Navigation
**Learning:** Custom calendar components often miss basic a11y attributes on navigation controls like previous/next month buttons and dropdown toggles, which makes them difficult to use with screen readers and keyboard navigation.
**Action:** Always add `aria-label`, `title`, and explicit `focus-visible` states to icon-only buttons and custom dropdown toggles when building or reviewing custom date pickers.
