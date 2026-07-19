## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-07-20 - Memoizing Dashboard Lists
**Learning:** In React dashboards, mapping over a list of items where one item has an active/hover state can cause the entire list to re-render if the child components aren't memoized and stable callbacks aren't used.
**Action:** Always wrap list items in `React.memo` and use stable `useCallback` for event handlers when rendering long lists of metric items.
