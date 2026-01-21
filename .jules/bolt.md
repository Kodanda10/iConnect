## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-12-17 - React.memo with Stable Callbacks using useRef
**Learning:** Stabilizing callbacks for `React.memo` components can be tricky when those callbacks depend on frequently changing state (like loading status). Including the state in the dependency array breaks memoization.
**Action:** Use `useRef` to hold the latest state values and update them via `useEffect`. Access the ref's `current` value inside the `useCallback` to read the state without adding it as a dependency. This ensures the callback function identity remains stable, preventing unnecessary re-renders of memoized child components.
