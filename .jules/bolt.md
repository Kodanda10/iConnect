## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-05-21 - String Allocation in Hot Loops (V8)
**Learning:** `string.split('-')` creates an array and multiple string objects for every call. In a loop of 100k items, this generates huge GC pressure. `charCodeAt` is ~4.5x faster for parsing fixed-format strings like `YYYY-MM-DD`.
**Action:** For high-frequency parsing of known formats, use `charCodeAt` or `substring` to avoid allocation. Fallback to `split` for robustness if needed.
