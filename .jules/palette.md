## 2024-12-18 - Glass Design System Form Accessibility
**Learning:** The custom "Glass" design system often separates `<label>` and `<input>` structurally for styling, leading to unassociated labels. This breaks screen reader navigation.
**Action:** Always enforce `htmlFor` on labels matching the input `id` even in custom stylized containers. For password inputs, integrated visibility toggles (inside the glass container) significantly reduce abandonment rates.
