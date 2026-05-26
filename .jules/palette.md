## 2026-05-26 - Dynamic ARIA Labels
**Learning:** When adding aria-label attributes to elements displaying dynamic content, do not use hardcoded labels (which replace inner text). Instead, use dynamic labels like aria-label={"Select month, currently " + currentValue}. Also, use aria-pressed instead of aria-selected for elements with role="button" (like calendar days).
**Action:** Use dynamic aria-labels for dropdowns reflecting current state and aria-pressed for custom interactive buttons.
