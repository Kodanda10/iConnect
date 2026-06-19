
## 2026-06-19 - Prevent Unnecessary List Re-renders in React
**Learning:** In React, rendering lists of components where an inline function or changing state in the parent causes all list items to re-render can be a performance bottleneck.
**Action:** Use `React.memo` on list item components and `useCallback` for the event handlers passed from the parent to avoid unnecessary re-renders of the entire list when only one item's state (like hover) changes.
