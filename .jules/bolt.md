## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-03-19 - Zero-Allocation String Parsing in Hot Loops
**Learning:** In Cloud Functions iterating over thousands of items, even `String.prototype.split('-')` creates measurable overhead due to intermediate string and array allocations.
**Action:** When parsing well-known string formats (like `YYYY-MM-DD` dates) in hot loops, use a zero-allocation fast-path with `charCodeAt()`. Always fall back to robust parsing (e.g. `split()`) for inputs that don't match the strict fast-path length and format. Remember to bounds check extracted character codes to ensure they are actual digits.
