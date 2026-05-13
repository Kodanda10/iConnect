## 2025-02-12 - Prevent Prompt Injection in Greeting Generation
**Vulnerability:** User inputs (`name` and `leaderName`) were being passed directly into the Gemini AI prompt template without sanitization, allowing prompt injection attacks or XSS if the generated text is rendered in a web client.
**Learning:** Always treat inputs being interpolated into AI prompts as untrusted, similar to SQL injection vulnerabilities. The memory constraints showed that generic HTML removal and length limits mitigate basic prompt injection and XSS.
**Prevention:** Apply `sanitizeInput` to all user-provided strings before they are used in AI prompts or any structured generation.
