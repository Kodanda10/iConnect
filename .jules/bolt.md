## 2026-06-30 - Extracting O(N^2) Operations from Map Loops
**Learning:** In DataMetricsCard, mapping over items and calculating `Math.max` on the same array inside the loop creates an O(N^2) operation during every render cycle.
**Action:** Memoize array-wide calculations (like max/min/sum) outside of the map function using `useMemo` and pass the pre-calculated value down as a prop.
