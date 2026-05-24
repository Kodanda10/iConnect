## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-05-24 - Optimize Daily Scan Task Lookup
**Learning:** Repeated `.toDate().toISOString()` calls inside O(N*M) loops cause significant allocation overhead. O(N^2) array searches are slow.
**Action:** Pre-compute O(1) lookup sets before entering hot loops, and avoid date instantiation within the loops.
