## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-07-04 - Prevent O(n²) in JSX Map
**Learning:** Computing complex array aggregations like Math.max(array.map(...)) inside a .map() callback creates an O(n²) rendering bottleneck.
**Action:** Always pre-calculate aggregations before the return statement or map loop in React functional components, reducing complexity to O(n).
