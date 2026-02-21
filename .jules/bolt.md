## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-02-21 - Zero-Allocation Date Parsing & Loop Consolidation
**Learning:** For strict date formats (YYYY-MM-DD), using `charCodeAt` at fixed indices avoids string allocation (`split`) and parsing (`parseInt`), yielding a 16x speedup in hot loops. Also, consolidating multiple passes over a large collection into a single pass reduced execution time by 4.5x.
**Action:** Use fixed-index character code checks for strict string formats in performance-critical loops. Combine multiple iterations over the same dataset into a single pass where possible.
