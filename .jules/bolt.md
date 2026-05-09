## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-10-24 - Optimize dailyScan Tasks
**Learning:** Repeated date formatting and O(N²) nested array lookups inside large processing loops create massive allocation overhead and block the thread in Node.js.
**Action:** Extract expensive date allocations outside loops and pre-compute O(1) hash maps/Sets for lookups.
