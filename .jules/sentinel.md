# Sentinel's Journal

## 2025-02-23 - Account Enumeration in Login UI
**Vulnerability:** The login page explicitly handled `auth/user-not-found` and `auth/wrong-password` with distinct error messages ("User not found" vs "Incorrect password").
**Learning:** Developers often prioritize UX (telling the user exactly what's wrong) over Security (preventing username harvesting), especially when using granular error codes from SDKs like Firebase.
**Prevention:** Always consolidate authentication errors into a generic "Invalid email or password" message. Use a linter or code review checklist to flag specific error code handling in auth flows.
