## 2025-02-18 - Keyboard Accessibility for Hover-Dependent Components
**Learning:** Components that rely solely on `onMouseEnter`/`onMouseLeave` (like `DataMetricsCard`) exclude keyboard users. Using `div`s for these interactions further exacerbates the issue by removing them from the tab order.
**Action:** Convert interactive `div`s to `<button type="button">`. Map `onFocus` to the hover handler and `onBlur` to the leave handler. Add `focus:ring-2` styles to make focus visible. Ensure `w-full text-left` classes are added to preserve the original block layout of the `div`.
