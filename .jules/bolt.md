## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-10-22 - O(N²) Calculations Inside Map Render Loops
**Learning:** Performing aggregate operations like `Math.max` inside a `.map()` render loop over the same array causes O(N²) calculations, heavily impacting performance for large datasets.
**Action:** Always extract and memoize such aggregate calculations outside of the render loop using `useMemo`. When dealing with fallbacks, ensure default arguments (like `1` in `Math.max(..., 1)`) are retained to prevent regressions on empty arrays.
