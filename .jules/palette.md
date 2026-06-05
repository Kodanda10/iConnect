## 2026-06-05 - Dynamic ARIA Labels in Custom React Controls
**Learning:** Hardcoding labels like 'Select month' on dropdown toggles overwrites the text content in the accessibility tree, hiding the selected value. Also, custom calendar days using <button> must use aria-pressed rather than aria-selected because role="button" does not support aria-selected.
**Action:** Always include the current state in dynamic aria-label attributes for toggles and strictly enforce aria-pressed for button-based selection states.
