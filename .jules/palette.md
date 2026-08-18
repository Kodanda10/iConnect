## 2025-01-14 - Improve Block Item Keyboard Accessibility
**Learning:** Users who rely on keyboard navigation could not access the hover-triggered GP metrics detail view because `div` items used for the blocks breakdown lacked `role`, `tabIndex`, and keyboard event handlers.
**Action:** Add `role="button"`, `tabIndex={0}`, `aria-expanded`, and `onKeyDown` with `focus-visible` styling to all custom non-button list elements that trigger hover state views.
