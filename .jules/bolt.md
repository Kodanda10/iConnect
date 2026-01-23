## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-21 - String Suffix Matching vs Parsing
**Learning:** For date matching in hot loops, strict string comparison (e.g., `endsWith('-MM-DD')`) is significantly faster (~60% improvement) than splitting and parsing integers. However, simple optimizations can fail if they don't handle negative cases efficiently (falling back to the slow path for every non-match).
**Action:** Use a fast path check (like `endsWith`) but ensure it's guarded by strict format checks (e.g. length check) so that it can definitive REJECT non-matches without falling back to the slow path, while still supporting robust fallback for irregular data.
