## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-20 - Math.max inside Render Map
**Learning:** Performing aggregate calculations like `Math.max` directly inside a `.map()` render loop leads to an unintended O(N²) time complexity.
**Action:** Always extract and calculate such values once using `useMemo` outside of the render loop mapping so the component renders efficiently, especially for potentially large datasets like Gram Panchayat constituent counts.
