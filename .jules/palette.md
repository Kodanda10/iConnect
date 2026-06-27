## 2024-12-17 - Missing Keyboard Support on Interactive Divs
**Learning:** Custom interactive elements (like the hoverable BlockItem cards used for GP breakdowns) that only use mouse events (`onMouseEnter`/`onMouseLeave`) completely lock out keyboard users from accessing rich nested data.
**Action:** Always pair hover-based reveal patterns with equivalent keyboard focus states (`onFocus`/`onBlur`, `tabIndex={0}`) to ensure equitable access to detailed analytics.
