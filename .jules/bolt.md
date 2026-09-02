## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-02-23 - DataMetricsCard O(N²) Performance Anti-Pattern
**Learning:** In React components rendering lists dynamically, performing aggregate calculations like `Math.max()` within `.map()` render loops results in O(N²) complexity. The data array is iterated on every item's render pass.
**Action:** Always extract and memoize such calculations using `useMemo` before returning JSX, maintaining identical fallback values (`1`) to prevent `-Infinity`/division-by-zero errors.
