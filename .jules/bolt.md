## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-04-26 - [O(1) Set Lookups in Cloud Functions]
**Learning:** O(N²) nested .some() searches inside large dataset iterations cause significant Cloud Function performance bottlenecks.
**Action:** Always pre-compute a Set with composite string keys outside hot loops.
