## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-06-06 - Optimize daily scan hot loop
**Learning:** Found an O(N^2) performance bottleneck in daily scans where Array.some() was used inside a loop over thousands of constituents. Additionally, .toISOString() string allocation was occurring on every iteration.
**Action:** Replace nested array lookups with a pre-constructed Set for O(1) lookups and hoist date string allocations completely outside hot loops.
