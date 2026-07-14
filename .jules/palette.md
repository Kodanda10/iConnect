## 2025-07-14 - Add ARIA Labels to Calendar Navigation
**Learning:** Icon-only calendar navigation components often lack proper ARIA labels, making them invisible or confusing to screen reader users despite having clear visual affordances (like chevrons). Dropdowns also need clear accessible labels indicating their purpose.
**Action:** Always verify icon-only interactive elements contain `aria-label` and `title` attributes (or visually hidden text) to ensure keyboard and screen reader accessibility from the start of implementation.
