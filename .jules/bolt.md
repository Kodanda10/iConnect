## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-08-20 - Math.max in Render Loops
**Learning:** Calling `Math.max` over an entire array directly inside a `.map` loop creates an O(N²) time complexity issue. This happens frequently in Dashboard components in Next.js apps.
**Action:** Extract aggregation computations like `Math.max` from `.map` loops and cache them using `useMemo` before returning JSX to ensure the operation is only O(N). Ensure fallbacks like `1` are retained to avoid edge-cases like division by zero.
