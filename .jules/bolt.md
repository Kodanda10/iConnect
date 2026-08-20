## 2025-01-24 - O(N²) Re-render in DataMetricsCard
**Learning:** Calculating `Math.max` inside a `.map()` loop for progress bars causes O(N²) recalculations on every render, blocking the main thread during animations.
**Action:** Always extract and memoize aggregate calculations (like max/min) outside of render loops using `useMemo` to keep them O(N).
