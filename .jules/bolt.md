## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-12-17 - O(N²) Performance in React Maps
**Learning:** Performing aggregate calculations like `Math.max` across an entire array from within a `.map()` render loop causes O(N²) time complexity during renders, drastically reducing performance on larger datasets.
**Action:** Always extract and memoize aggregate loop-independent calculations using `useMemo` before mapping. Move hook declarations above conditional early returns to avoid cascading render issues and strictly maintain ordering.
