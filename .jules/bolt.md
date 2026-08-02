## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-05-20 - Sequential Promise Waterfall
**Learning:** In React components like Settings page, making 4 independent API calls sequentially using `await` causes a significant waterfall delay (O(N) network time).
**Action:** Always group independent promises using `Promise.all` to fetch data concurrently, reducing network latency to the longest single request (O(1) network time).
