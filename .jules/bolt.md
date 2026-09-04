## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-20 - Extracting Max Calculation from Render Loop
**Learning:** Calculating an aggregate value like `Math.max` for a dataset directly inside a `.map()` render loop over the same dataset results in an O(N²) time complexity. This can cause significant slowdowns as the dataset size grows.
**Action:** Always extract such aggregate calculations outside of the `.map()` loop, ideally memoizing them with `useMemo` so they are only computed when dependencies change.
