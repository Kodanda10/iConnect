## 2024-12-17 - Testing Accessibility Labels
**Learning:** `screen.getByLabelText` matches both `<label>` content and `aria-label` attributes. When an input label (e.g., "Password") shares text with a button's `aria-label` (e.g., "Show password"), tests can fail with "multiple elements found".
**Action:** Use specific selectors in tests (e.g., `{ selector: 'input' }`) or ensure `aria-label` text is distinct enough to avoid ambiguity, or use `getByRole` for buttons instead.
