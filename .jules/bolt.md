## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-06-08 - Optimize Daily Scan Hot Loop
**Learning:** Using .some() inside a loop over constituents for checking existing tasks causes an O(N^2) bottleneck. Additionally, repeatedly calling .toISOString() inside the loop adds unnecessary string allocation overhead.
**Action:** Pre-construct a Set with unique keys for O(1) lookups and hoist date string formatting outside the loop.
