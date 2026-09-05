## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-28 - Optimize aggregate calculations in render loops
**Learning:** Performing aggregate calculations (like `Math.max`) directly inside `.map()` render loops results in O(N²) complexity.
**Action:** Always extract these calculations and cache them using `useMemo` before conditional early returns to optimize render cycles.
