## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-20 - Pre-parsing in Hot Nested Loops
**Learning:** In nested loops like querying constituents over a date range, operations like date parsing (`string.split`, `parseInt`) within the innermost loop become severe performance bottlenecks.
**Action:** Pre-parse strings or compute constants once per constituent *before* entering the date range loop. This converts operations from O(Days * Constituents) to O(Constituents).
