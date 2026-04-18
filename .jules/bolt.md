## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-12-11 - Date.toISOString in Node.js O(N) Loops
**Learning:** `new Date().toISOString()` is deceptively expensive inside high-iteration loops because it instantiates and allocates new string structures continually. In `functions/src/dailyScan.ts`, we were calling this twice per constituent for thousands of constituents in a nested lookup. Additionally, searching an array inside a loop yields an O(N²) penalty.
**Action:** Always pre-calculate invariant dates like "today" and "tomorrow" string formats BEFORE loop boundaries. When doing existence checks over lists (like `existingTasks`), iterate once to build an O(1) lookup map (like a `Set<string>`) to convert O(N²) into O(N) operations.
