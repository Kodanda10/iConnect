1. **Import `useMemo` from 'react'**
   Modify the import statement in `iconnect-web/src/components/dashboard/DataMetricsCard.tsx` to include `useMemo`.

2. **Memoize the maximum count calculation**
   Instead of calculating `Math.max(...(gpData[hoveredBlock] || []).map(g => g.count), 1)` inside the `.map()` loop (which runs for every item and is therefore O(N²)), pre-calculate it once per `hoveredBlock` using `useMemo`. This makes the complexity O(N).

3. **Pass the memoized `maxCount` to `GPProgressBar`**
   Update the `GPProgressBar` rendering to use the pre-calculated memoized value.

4. **Verify the optimization works**
   Run the tests and build to ensure nothing broke.

5. **Update journal**
   Log this finding in `.jules/bolt.md`.
