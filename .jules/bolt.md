## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-20 - Math.max inside .map in render loops
**Learning:** Calling Math.max or other aggregate functions over an array inside a .map() loop in a React component's render function causes O(N^2) complexity. This becomes a bottleneck when rendering lists with many items (e.g., hundreds of GPs).
**Action:** Always memoize aggregate calculations using useMemo outside of the .map() loop to ensure they are only calculated once per relevant state change, reducing complexity to O(N).
