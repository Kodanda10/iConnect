## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-02-26 - O(N*31) and new Date() bottleneck in Calendar
**Learning:** Calling new Date() on thousands of string dates inside a loop repeated 31 times per render (once for each day of the month) freezes the UI.
**Action:** Use useMemo to pre-group events by day for the selected month using string splitting instead of Date parsing, enabling O(1) lookups for each day cell.
