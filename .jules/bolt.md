## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-08-16 - Parallelizing API Requests
**Learning:** Sequential `await` statements inside `useEffect` or data fetching functions create waterfall network requests, significantly delaying rendering for components depending on multiple datasets.
**Action:** Always wrap independent async operations (like fetching multiple unrelated date metrics) in `Promise.all` to fetch them concurrently, heavily reducing total execution time.
