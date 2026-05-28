## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-05-28 - [Hoist Date Formatting in Hot Loops]
**Learning:** When optimizing date formatting in Cloud Functions to avoid string allocation overhead in hot loops, using manual local time methods like `.getFullYear()` instead of `.toISOString().split('T')[0]` introduces local vs UTC timezone bugs.
**Action:** Hoist the `.toISOString()` calls completely outside the loop.
