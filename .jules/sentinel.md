## 2025-05-23 - PII Logging in Data Entry and Auth
**Vulnerability:** Explicit logging of constituent names, DOBs, and Anniversaries in client-side upload components, and User UIDs in backend auth functions.
**Learning:** Developers often log full objects or identifiers for debugging data import/auth flows without considering PII exposure in console/logs.
**Prevention:** Use `redactToken` or similar utilities for identifiers; strictly forbid logging of constituent data objects in production code.
