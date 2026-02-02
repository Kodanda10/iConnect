## 2024-12-16 - Login Accessibility Gaps
**Learning:** The login page labels were visually present but not programmatically associated with inputs (`htmlFor`/`id` mismatch).
**Action:** Always verify label-input associations using screen reader tests or `getByLabelText` in unit tests.

## 2024-12-16 - Error Message Roles
**Learning:** Dynamic error messages in forms lacked `role="alert"`, preventing immediate announcement by screen readers.
**Action:** Add `role="alert"` to any conditional error message container to ensure accessibility.
