## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-20 - String Split vs charCodeAt in Hot Loops
**Learning:** In hot loops processing tens of thousands of items (e.g., daily constituent scan), using `String.prototype.split('-')` and `parseInt()` for simple YYYY-MM-DD date parsing creates significant memory allocation overhead and GC pressure.
**Action:** Implemented a zero-allocation fast-path using `charCodeAt()` and manual math to parse padded YYYY-MM-DD strings. This avoids intermediate array allocations and yields a ~12x speedup in isolated benchmarks. Always include a fallback for non-padded strings.
