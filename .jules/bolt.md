## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-21 - Avoiding String Allocations in Hot Loops
**Learning:** Using `String.prototype.split('-')` on `YYYY-MM-DD` strings inside nested loops (like scanning thousands of constituents over multiple dates) allocates huge numbers of small objects and strings, heavily degrading performance due to GC pressure.
**Action:** Use a fast-path with `String.prototype.charCodeAt()` to directly extract character values and compute numbers for standard formats without allocation, falling back to `split()` for non-standard formats.
