## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-20 - Memoization in Render Loops
**Learning:** In the DataMetricsCard component, performing aggregate calculations like Math.max directly inside a .map() render loop leads to O(N²) complexity, significantly degrading performance for large datasets.
**Action:** Always extract and memoize expensive or aggregate calculations using useMemo at the top level of the component before any early returns to avoid cascading complexity in render cycles.
