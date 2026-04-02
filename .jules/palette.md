## 2024-04-02 - Accessible Custom Calendars
**Learning:** When building custom interactive calendar components using buttons for days, using `aria-selected` is invalid because `role="button"` does not support it. Additionally, days that lack full date context in their text content are completely inaccessible to screen readers.
**Action:** Always use `aria-pressed` for selected day buttons, `aria-current="date"` for today's date, and compute a full, visually hidden or `aria-label` string (e.g. "1 January 2024") for each day button to provide context to screen readers.
