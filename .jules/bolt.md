## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-11-01 - O(N^2) Array Methods Inside Render Loop
**Learning:** Calculating Math.max(...array.map()) directly on a prop passed to a component within an array.map() render loop causes an O(N^2) time complexity during the render phase.
**Action:** When a static maximum or derived array value is needed for all children in a loop, pre-calculate it once outside the loop (before the return statement or within a useMemo) to ensure O(N) complexity.
