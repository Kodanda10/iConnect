## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-07-03 - Date Parsing and String Operations in Hot Loops
**Learning:** In tight loops (like iterating over all constituents for daily scans), calling `targetDate.getDate()` repeatedly and allocating arrays via `String.split('-')` creates significant performance overhead.
**Action:** When comparing dates in a loop, parse the target date once outside the loop into raw integers. For strings, use character code parsing (`charCodeAt`) to avoid allocations instead of splitting if the format is strictly known.
