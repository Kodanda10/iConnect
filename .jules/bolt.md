## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-02-14 - Optimize dailyScan existing task lookup
**Learning:** Using `Array.prototype.some` inside a loop over constituents for matching existing tasks causes an O(n^2) time complexity. Since both the constituents array and the existing tasks list can grow, doing an O(n) scan inside an O(n) loop causes slow processing.
**Action:** Create a Set with a composite key of `constituentId_type_dueDate` from the existing tasks before iterating over the constituents, which reduces the lookup to O(1) and the overall complexity to O(n).
