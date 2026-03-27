## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-23 - Avoiding O(N²) Calculations in Render Loops
**Learning:** Performing array operations like `Math.max(...items.map(...))` inside a `.map` loop during component rendering causes an O(N²) performance bottleneck, significantly slowing down renders as lists grow.
**Action:** Always extract calculations that iterate over the entire array outside of any rendering loop, computing the value once and passing it as a stable prop to child components wrapped in `React.memo`. Use `useCallback` to stabilize event handlers that are passed down to list items.
