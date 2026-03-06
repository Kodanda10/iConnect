## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-09 - Inline calculation inside React .map() causing O(N^2) render performance hit
**Learning:** Performing a costly calculation (like `Math.max(...array.map(item => item.value))`) inline inside a React `.map` function means that calculation runs for *every* item during the render phase. In large arrays, this changes a linear O(N) rendering process into an O(N²) calculation, heavily blocking the main thread.
**Action:** Always extract aggregations and independent calculations outside of mapping loops. Compute values like `max` or `min` once beforehand, and pass them as stable props to child components (which should be wrapped in `React.memo`).
