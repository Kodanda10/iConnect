## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-12-17 - O(N²) Render Performance Hit in React Maps
**Learning:** Inline calculations inside a `.map()` loop during rendering, especially calculations that iterate over the entire array (like `Math.max(...array.map())`), create an O(N²) complexity bottleneck that runs on every render.
**Action:** Always extract whole-array computations outside of `.map()` rendering loops. Store the calculated result in a variable and pass it down as a stable prop. Combined with `React.memo` on the child component, this avoids both the repeated calculation and unnecessary re-renders.