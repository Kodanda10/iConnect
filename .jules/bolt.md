## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-12-17 - O(N^2) Recalculation inside Render
**Learning:** Calculating `Math.max()` by `.map()`ing over an array *inside* another `.map()` for the same array causes an O(N²) operation on every render in React.
**Action:** Always memoize derived maximums or aggregates outside the rendering loop using `useMemo` when rendering lists of progress bars or similar UI components.
