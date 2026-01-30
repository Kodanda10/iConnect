## 2024-12-16 - Glass Input Icon Positioning
**Learning:** The `glass-input-dark` class has fixed padding. To add right-aligned icons (like password toggles), you must explicitly add `pr-12` (3rem) to the input and absolute position the icon at `right-4`.
**Action:** When adding icons to glass inputs, always pair `absolute right-4` on the icon with `pr-12` on the input to prevent text overlap.
