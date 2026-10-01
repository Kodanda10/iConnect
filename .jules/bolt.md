## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-02-09 - O(N²) calculations in render loops
**Learning:** Dashboard components in iConnect (like DataMetricsCard) sometimes perform aggregate calculations (e.g., Math.max) inside .map() render loops, creating hidden O(N²) performance bottlenecks during component re-renders.
**Action:** Extract aggregate calculations from render loops and cache them using useMemo at the top level of the component (before any early conditional returns) to ensure O(N) complexity and prevent React hook errors.
