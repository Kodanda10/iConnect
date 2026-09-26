## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-20 - O(N²) Performance in React Maps
**Learning:** Performing aggregate calculations like `Math.max` inside a React `.map()` render loop over the same array leads to an O(N²) operation that slows down rendering on large arrays.
**Action:** Always extract and memoize such aggregate calculations with `useMemo` before rendering the loop or hitting any early return statements.
