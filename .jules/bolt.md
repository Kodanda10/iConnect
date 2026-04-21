## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-12-11 - Date Optimization Timezone Safety
**Learning:** When optimizing date loops (like removing repeated `.toISOString().split('T')[0]` calls), be careful not to accidentally swap UTC dates with local `.getDate()` / `.getFullYear()` logic. It breaks date matching across timezone boundaries.
**Action:** Hoist the safe, original UTC-based formatting method completely outside the loop instead of replacing it with naive local-time string concatenation.
