## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-02-05 - Loop Merging & Manual Date Parsing
**Learning:** Merging 3 separate iterations over a 50k+ dataset into a single pass provided a ~30% performance boost (405ms -> 285ms). Also, replacing `date.split('-')` and `new Date()` with manual string parsing (substring + integer math) significantly reduces GC pressure in hot loops.
**Action:** Always verify if multiple loops over the same large collection can be merged. For date strings in fixed formats (YYYY-MM-DD), prefer manual parsing in critical paths.
