## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-03-20 - Zero-Allocation Date Parsing in Hot Loops
**Learning:** In Node.js hot paths (e.g. nested iteration over arrays like constituents and date ranges), `String.prototype.split()` creates significant overhead by allocating arrays and new strings. In `functions/src/generateTasksForDateRange.ts`, the repeated use of `.split('-')` caused memory pressure and slower execution.
**Action:** Replaced `.split('-')` with a zero-allocation fast-path using `.charCodeAt()` for standard `YYYY-MM-DD` formats. This avoids array instantiation and string copying by using direct ASCII arithmetic, falling back to `.split()` only for non-standard formats.
