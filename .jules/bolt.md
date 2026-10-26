## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-20 - ESLint 'no-use-before-define' blocks builds
**Learning:** In the iConnect Next.js app, ESLint strictly enforces 'no-use-before-define'. Functions called within hooks like `useEffect` must be explicitly declared above the hook. Otherwise, the linter fails and blocks builds.
**Action:** Always ensure function declarations are placed before they are referenced, especially within React hooks.

## 2024-05-20 - Cascading Renders from Synchronous setState in useEffect
**Learning:** Calling `setState` synchronously within a `useEffect` triggers a secondary cascading render cycle, which harms performance and causes ESLint errors (`react-hooks/set-state-in-effect`).
**Action:** When state needs to be synchronized from external props (e.g., updating a component's internal view state when a prop changes), use the "Render Phase Update" pattern by keeping track of the previous prop value in state and updating during render, avoiding the `useEffect` entirely.
