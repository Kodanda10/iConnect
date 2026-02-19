## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-23 - String Allocation in Hot Loops
**Learning:** `split('-')` and `parseInt()` inside a hot loop (iterating thousands of records) creates significant GC pressure and overhead. Using `charCodeAt` for direct integer arithmetic on fixed-format strings (like 'YYYY-MM-DD') is ~8x faster.
**Action:** For hot loops parsing standard formats, prefer character-level access over string splitting.
