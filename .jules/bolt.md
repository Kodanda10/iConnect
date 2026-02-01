## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-27 - String Suffix Matching for Dates
**Learning:** Parsing "YYYY-MM-DD" strings with `split` and `parseInt` is ~4.5x slower than checking `endsWith("-MM-DD")` in V8.
**Action:** For hot loops checking date matches against a fixed target date, pre-calculate the suffix (e.g. "-12-25") and use `endsWith` if the input format is guaranteed.
