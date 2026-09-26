## 2024-12-11 - Add ARIA label to Dashboard Layout Notification Bell
**Learning:** Found an icon-only button (Notification Bell) lacking an accessible label. This pattern impairs screen reader users' ability to navigate core app controls.
**Action:** Always ensure any icon-only button contains a descriptive `aria-label` attribute, even if it has a `title` attribute or tooltip.
