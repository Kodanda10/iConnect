## 2024-12-18 - Calendar Accessibility Patterns
**Learning:** Screen readers often default to reading the button content (e.g., "15") which provides poor context in a calendar. Using `aria-label` with a full localized date (e.g., "December 15, 2024") significantly improves usability. Also, `aria-current="date"` is a semantic way to indicate "today", and `aria-pressed` works better than `aria-selected` for button-based selection in this codebase.
**Action:** When implementing grid-based date pickers, always override the day number content with a full date description in `aria-label`.
