## 2024-05-22 - Accessible Drag & Drop Zones
**Learning:** Custom drag & drop zones implemented as `div`s create keyboard traps if they don't explicitly handle keyboard interaction.
**Action:** Always add `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers for Enter/Space to `div`-based file uploads.
