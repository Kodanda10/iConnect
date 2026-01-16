## 2025-01-20 - PII in Function Logs
**Vulnerability:** Meeting titles containing sensitive PII were logged in plain text in `functions/src/triggers.ts`.
**Learning:** Cloud Function logs are often overlooked as a data leak vector. Developers often log full objects for debugging without considering PII.
**Prevention:** Use a dedicated `redactText` or similar utility for ALL user-generated content in logs. Never log full objects if they might contain PII.
