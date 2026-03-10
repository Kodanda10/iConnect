## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-12-26 - Zero-allocation Date String Parsing in Hot Loops
**Learning:** `String.prototype.split('-')` allocates arrays and strings, causing significant GC pressure and overhead when called thousands of times in a hot loop (like `dailyScan.ts`). Benchmarking shows that an ASCII `.charCodeAt()` parser avoids these allocations entirely, yielding a ~11x speedup in V8 for standard `YYYY-MM-DD` strings.
**Action:** When parsing standard formatted strings in high-iteration loops, use a fast-path with `.charCodeAt()`. Always include character validation (e.g., checking for valid digits) and fallback to standard parsing (e.g., `split`) for irregular inputs to prevent incorrect calculations.
