## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-12-17 - O(N²) in Render Loops
**Learning:** Performing aggregate calculations like `Math.max` directly inside a `.map()` render loop leads to O(N²) complexity, which can severely impact performance during frequent re-renders.
**Action:** Always extract and memoize such aggregate calculations using `useMemo` before they are passed into components rendered in loops. Ensure this is done before conditional early returns.
