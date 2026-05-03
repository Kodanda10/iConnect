## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-21 - O(N^2) Array Searches in Cloud Functions
**Learning:** Using `.some()` inside a loop over large datasets (like constituents) creates an O(N^2) bottleneck. Additionally, repeatedly formatting dates (e.g. `.toISOString()`) inside hot loops adds significant allocation overhead.
**Action:** Pre-compute reference data into a `Set` with composite string keys outside the loop for O(1) lookups, and extract expensive string formatting operations completely outside the loop.
