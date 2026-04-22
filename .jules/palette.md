
## 2024-04-22 - Adding ARIA attributes to GlassCalendar
**Learning:** Custom interactive components like `GlassCalendar` inherently lack semantic meaning and keyboard accessibility out of the box compared to native HTML inputs. In React, interactive date pickers require detailed ARIA configurations (like `aria-haspopup="listbox"`, `role="listbox"`, `role="option"`, `aria-selected`, `aria-label`, `aria-pressed`, and `aria-current`) to ensure screen readers understand the structure and state.
**Action:** Always ensure that custom interactive components mimicking native controls are paired with robust ARIA implementations to provide feature parity for visually impaired users. Pay special attention to dynamic dropdowns and grid selections.
