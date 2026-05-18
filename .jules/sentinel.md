## 2026-05-18 - Prevent AI Prompt Injection
**Vulnerability:** User inputs were passed directly into Gemini AI prompts without sanitization, allowing prompt injection and XSS.
**Learning:** AI prompt inputs must be treated with the same security rigor as SQL queries or HTML output.
**Prevention:** Always apply length limits and character stripping (e.g., `sanitizeInput`) to user data interpolated into AI prompts.
