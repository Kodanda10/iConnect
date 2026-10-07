## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-12-18 - Fix O(N²) complexitiy in render loops
**Learning:** Performing aggregate calculations like `Math.max` across an array directly inside a `.map()` render loop results in O(N²) complexity.
**Action:** Extract these calculations out of the loop and cache them using variable assignment or `useMemo` before mapping over elements.
