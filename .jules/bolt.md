## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-05-23 - O(N²) and Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations, repeated .toISOString() calls and O(N) list scanning per iteration cause an O(N²) performance bottleneck.
**Action:** When repeatedly checking for existing entities based on dates, hoist the date parsing/formatting outside the hot loop and pre-compute an O(1) Set or Map for entity lookups.
