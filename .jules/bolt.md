## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-12-18 - Inline Array Calculations in React Renders
**Learning:** Performing inline calculations over an array (e.g. `Math.max(...data.map(d => d.value))`) inside of a `.map()` that renders a list of items causes an $O(N^2)$ iteration over the array on every re-render of the component, which is a significant performance hit for large arrays.
**Action:** Extract list-wide mathematical computations like min, max, or sum *outside* of the JSX `.map()` render loop and store the result in a local variable or memoize it, then pass that stable value as a prop to the child components.
