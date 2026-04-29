## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-20 - Avoid O(N²) array lookups in hot loops
**Learning:** Nested .some() array searches and expensive Date operations (like .toISOString()) inside large data loops create severe bottlenecks in Cloud Functions.
**Action:** Pre-compute reference arrays into Sets keyed by composite strings outside the loop for O(1) lookups, and hoist expensive common operations above the loop.
