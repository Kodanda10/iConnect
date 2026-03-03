## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-28 - Optimizing React List Rendering in DataMetricsCard
**Learning:** In React components like `DataMetricsCard`, rendering list items with inline anonymous functions (e.g., `onMouseEnter={() => handleHover(id)}`) defeats `React.memo` because a new function reference is created on every render. This causes all list items to re-render when state changes, which is especially noticeable for frequent events like hover.
**Action:** When rendering lists, wrap item components in `React.memo` and pass stabilized callbacks using `useCallback` from the parent. The child component should invoke the callback with its specific data (like an ID) instead of the parent creating a closure for each item.
