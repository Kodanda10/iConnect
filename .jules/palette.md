## 2026-05-28 - Dynamic ARIA Labels in Custom Selects
**Learning:** When using buttons as custom dropdown triggers that display the current selection, static aria-labels completely obscure the current value for screen readers. Furthermore, interactive calendar day buttons with role='button' do not support aria-selected and must use aria-pressed.
**Action:** Always use dynamic aria-labels that combine the action and current state (e.g., 'Select month, currently Jan'), and use aria-pressed for selection states on role='button' elements.
