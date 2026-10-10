## 2025-12-17 - React Next.js Build and Lint Errors
**Vulnerability:** Build and deployment blocked due to React cascading render loops in `GlassCalendar.tsx` and `ValidatedDateInput.tsx`, and reference-before-initialization errors in `DataMetricsCard.tsx` and `upload/page.tsx`.
**Learning:** Next.js production builds aggressively fail on React hooks anti-patterns such as invoking `setState` synchronously within a `useEffect`, which triggers infinite loops and severe performance degradation.
**Prevention:** Strictly enforce the React "render phase update" pattern instead of effect-based state synchronization when responding to prop changes, and ensure functions are fully declared before they are called in effect hooks.
