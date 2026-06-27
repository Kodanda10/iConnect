1. **Identify Bottleneck**: In `DataMetricsCard.tsx`, the `BlockItem` components are rendered in a map loop. When the user hovers over one `BlockItem`, the `hoveredBlock` state changes in `DataMetricsCard`. This causes the entire `DataMetricsCard` to re-render, which in turn causes all `BlockItem` components (there could be many) to re-render, even though only two at most have changed their `isHovered` state (the one being hovered, and the one that was previously hovered).

2. **Fix `BlockItem` re-renders**:
   - Modify `BlockItem` to accept `onHover` and `onLeave` directly as stable functions, and pass `block.name` to them. Actually, simpler: wrap `BlockItem` in `React.memo` and modify `onMouseEnter` to be passed `block.name` or keep it taking a function but pass `useCallback`.
   - Actually, since `onMouseEnter={() => handleBlockHover(block.name)}` creates a new function on every render, `React.memo` wouldn't work out-of-the-box unless we provide a custom equality function.
   - Let's provide a custom equality function for `React.memo` or refactor `BlockItem` props to take `onHover: (name: string) => void` and use a stable callback from the parent.
   - Refactoring `BlockItem` is better:
     ```tsx
     interface BlockItemProps {
         block: BlockMetric;
         total: number;
         isHovered: boolean;
         onHover: (name: string) => void;
         onLeave: () => void;
     }

     const BlockItem = React.memo(function BlockItem({ block, total, isHovered, onHover, onLeave }: BlockItemProps) {
         // ...
         <div onMouseEnter={() => onHover(block.name)} onMouseLeave={onLeave} ...>
         // ...
     });
     ```
   - In `DataMetricsCard`:
     ```tsx
     const handleBlockHover = useCallback((blockName: string) => {
         setHoveredBlock(blockName);
         loadGPData(blockName);
     }, [loadGPData]);

     const handleBlockLeave = useCallback(() => {
         setHoveredBlock(null);
     }, []);
     ```
     And rendering:
     ```tsx
     <BlockItem
         key={block.name}
         block={block}
         total={metrics.total}
         isHovered={hoveredBlock === block.name}
         onHover={handleBlockHover}
         onLeave={handleBlockLeave}
     />
     ```

3. **Fix `GPProgressBar` re-renders**:
   - `GPProgressBar` is rendered inside `DataMetricsCard` based on `gpData[hoveredBlock]`. When `gpLoading` or `hoveredBlock` changes, these might re-render.
   - Wrap `GPProgressBar` in `React.memo`. Since its props are primitives or simple objects (`gp: GPMetric, maxCount: number, delay: number, index: number`), `React.memo` works well here.
     ```tsx
     const GPProgressBar = React.memo(function GPProgressBar({ gp, maxCount, delay, index }: GPProgressBarProps) {
     ```

This will prevent unnecessary re-renders of list items on hover, making the UI faster and more responsive, fulfilling Bolt's core focus of small, measurable performance improvements.
