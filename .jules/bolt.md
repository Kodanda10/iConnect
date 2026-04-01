## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-12-18 - Math.max inside map loop causes O(N^2)
**Learning:** Computing `Math.max(...array)` *inside* a `.map(item => ...)` loop on that exact same array forces the engine to iterate the whole list over again for every single rendered element. This creates an invisible O(N^2) performance bottleneck during React renders.
**Action:** Extract expensive aggregation computations like `Math.max` completely *outside* of any loops or `.map()` calls, compute it exactly once, and pass the static result into the loop items as a prop.

## 2025-12-18 - Unstable Event Handlers Bypass React.memo
**Learning:** Wrapping a component in `React.memo` is entirely useless if the parent component passes down new anonymous arrow functions (e.g., `onClick={() => handler(id)}`) on every render, as the prop reference changes every time.
**Action:** Extract inline arrow functions out of JSX. Update child components to accept raw identifiers (like IDs or names) as part of their event handler signatures (e.g., `onMouseEnter: (name: string) => void`), and wrap the parent's handler in `useCallback` to maintain a stable function reference across renders.
