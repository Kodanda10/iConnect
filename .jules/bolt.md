## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-27 - Date String Matching Optimization
**Learning:** When checking if a date string (YYYY-MM-DD) matches a specific month/day in a hot loop, using `endsWith("-MM-DD")` is significantly faster than `split` and `parseInt`.
**Action:** Pre-calculate the target suffix (e.g., "-12-25") outside the loop and use `endsWith` inside. Keep parsing as a fallback if data quality is uncertain.
