## 2025-03-09 - Add Input Validation for Meeting URLs
**Vulnerability:** The `meetUrl` input was not being validated before being persisted to Firestore in `createMeetingTicker`. This could allow attackers to save malicious protocols such as `javascript:` or `file:`.
**Learning:** We need to explicitly validate user-supplied URLs to restrict accepted protocols to expected schemes (HTTP/HTTPS) and prevent potential Cross-Site Scripting (XSS) when URLs are rendered by the client application.
**Prevention:** Always validate all external input using built-in URL parsers (e.g., `new URL()`) and assert correct protocols prior to storing URL links in the database.
