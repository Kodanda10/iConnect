
## 2025-03-03 - Added Input Sanitization against Prompt Injection / XSS
**Vulnerability:** External input properties like `name`, `ward`, and `leaderName` in `greeting.ts` were passed directly into a prompt template and executed through an AI prompt. This exposed the endpoint to Prompt Injection and XSS-like behavior by injecting arbitrary unescaped template values.
**Learning:** GenAI endpoints processing user data must treat string values from the request body as untrusted variables that require escaping, much like SQL query parameters.
**Prevention:** Always implement a dedicated function to sanitize generic user string inputs (e.g., removing `<, >, ', ", ;`) before including them directly in templates or LLM prompts.
