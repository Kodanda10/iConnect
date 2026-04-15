## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-12-11 - Loop Invariants vs Micro-Optimizations
**Learning:** In a performance context, extracting loop invariants (like `toISOString().split('T')[0]`) is a much more valuable and readable optimization than micro-optimizing standard string manipulation (like replacing `split` with `charCodeAt`). Code reviews will strictly reject unreadable micro-optimizations if they are not the true bottleneck.
**Action:** Always look for O(N) operations inside loops that can be hoisted to O(1) before attempting to speed up the O(1) operation itself.
