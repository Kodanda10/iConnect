## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-05-20 - Optimized Date Comparison
**Learning:** `String.prototype.split` and `parseInt` in a hot loop (thousands of constituents * multiple checks) adds significant overhead (~200ms vs ~50ms per 1M checks). Direct character code access (`charCodeAt`) for fixed-format strings (YYYY-MM-DD) is ~4x faster.
**Action:** Use optimized, zero-allocation string parsing for high-volume date checks when the format is strictly controlled, falling back to robust parsing for edge cases.
