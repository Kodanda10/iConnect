## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-12-18 - Extracted O(N²) Aggregate Math from Render Maps
**Learning:** Performing aggregate calculations like `Math.max` directly inside `.map()` rendering loops causes an O(N²) calculation issue where it re-calculates the array maximum for every individual element returned. In React/Next.js, this causes cascading render lag on large data sets (like constituents and GPs).
**Action:** Always extract and calculate array aggregates (e.g. `Math.max()`) outside of rendering `.map()` loops. Cache the result using `useMemo` so it's calculated exactly once when the dependency array changes.
