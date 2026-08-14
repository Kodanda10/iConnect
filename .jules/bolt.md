## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-08-14 - Batching independent async Firebase calls
**Learning:** In React useEffects that load initial data, multiple independent `await` calls to Firebase create a waterfall effect that delays rendering.
**Action:** When fetching multiple independent datasets for a single component view (like birthdays and anniversaries for today and tomorrow), group the promises in `Promise.all()` to execute them concurrently, reducing total wait time.
