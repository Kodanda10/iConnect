## 2026-06-07 - Prevent Prompt Injection
**Vulnerability:** User-provided inputs (like names) were interpolated directly into the Gemini AI prompt without sanitization, allowing prompt injection attacks.
**Learning:** Any user input passed to an LLM prompt must be sanitized to prevent malicious instructions from overriding the base prompt.
**Prevention:** Always use a sanitizeInput function to strip non-alphanumeric/safe characters from user input before prompt interpolation.
