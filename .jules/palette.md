## 2026-06-18 - Accessible Custom Toggle Buttons
**Learning:** When implementing selection states for custom interactive elements built with <button> tags (which inherently have role='button'), use the aria-pressed attribute rather than aria-selected, as aria-selected is not supported for button roles.
**Action:** Always add aria-pressed and aria-label attributes to custom toggle buttons to ensure proper accessibility for screen readers.
