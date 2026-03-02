## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-12-26 - String Splitting in Hot Loops
**Learning:** In nested loops over constituents and date ranges (e.g., `generateTasksForDateRange`), using `String.prototype.split('-')` and `parseInt` causes excessive object allocations and significant slowdowns.
**Action:** For standard predictable string formats like `YYYY-MM-DD`, always provide a zero-allocation fast-path using `charCodeAt()` before falling back to `split()`. This approach yields a ~6x performance improvement in hot loops compared to `split()`.
