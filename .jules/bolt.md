## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-02-27 - Zero-Allocation Date Parsing in Hot Loops
**Learning:** Even using `String.prototype.split('-')` and `parseInt` for basic `YYYY-MM-DD` date strings creates significant overhead via unnecessary string and array allocations in hot loops (e.g., iterating through all constituents).
**Action:** For simple standard formats like `YYYY-MM-DD`, use `.charCodeAt()` directly to extract digits, performing manual ASCII math (`- 48`). Always validate that the extracted characters are actual digits (`>= 48` and `<= 57`) to ensure safety. This pattern yields ~3-11x speedups.
