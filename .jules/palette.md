## 2024-05-22 - Ambiguous Label Matching in Playwright
**Learning:** `page.get_by_label("Text")` in Playwright performs a loose match, which can cause ambiguity when the label text is contained within another element's `aria-label` (e.g., "Password" label vs "Show Password" toggle button).
**Action:** Use `exact=True` (e.g., `page.get_by_label("Password", exact=True)`) or strict selectors when verifying accessible inputs that have associated icon buttons with similar accessible names.
