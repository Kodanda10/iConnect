## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-01 - Avoid nested array search and date formatting in hot loops
**Learning:** In Cloud Functions, O(N²) array lookups (like .some()) inside hot loops and repeated date formatting (.toISOString()) create significant performance overhead and unnecessary allocations.
**Action:** Always pre-compute existing data into a Set/Map with composite keys and extract static date string formatting completely outside loops for O(1) lookups.
