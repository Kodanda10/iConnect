## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-03-14 - Zero-Allocation String Parsing in O(N*M) Loops
**Learning:** Using `String.prototype.split('-')` inside deeply nested loops (e.g., iterating through multiple dates and then all constituents) creates continuous array and string allocations that heavily penalize garbage collection and execution time.
**Action:** For highly predictable formats like `YYYY-MM-DD` in hot loops, use `.charCodeAt()` to extract digits with zero allocation. Ensure bounds checking (ASCII 48-57) to prevent malformed values, and keep a slow-path fallback. This yielded ~6x speedup on local parsing micro-benchmarks.
