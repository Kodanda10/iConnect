## 2024-08-16 - Accessible Login Forms
**Learning:** Found that custom form components ("glass-input-dark") completely lacked basic accessibility structures like `htmlFor`/`id` bindings and proper `role="alert"` attributes for errors, making them difficult for both mouse and screen reader users to interact with.
**Action:** When implementing custom inputs, always remember to link labels with `id`s, add `aria-invalid`/`aria-describedby` for error states, and use `role="alert"` with `aria-live="assertive"` to announce dynamic error messages to screen readers.
