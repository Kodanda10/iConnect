## 2024-05-24 - Aggressive Input Sanitization
**Vulnerability:** Missing input sanitization for prompt injection and XSS
**Learning:** Cloud Functions handling user input need strict length limits (100 chars) and aggressive removal of HTML tags/control characters to prevent unclosed tag XSS and mitigate prompt injection.
**Prevention:** Always use `sanitizeInput` for untrusted strings before processing or logging.

## 2024-05-24 - AI Prompt Injection via User Input
**Vulnerability:** User input directly interpolated into Gemini AI prompts
**Learning:** Unsanitized user inputs (like names) can be used to inject instructions into LLM prompts. They must be strictly sanitized and length-limited before interpolation.
**Prevention:** Apply `sanitizeInput` to all dynamic user data before using it in `buildPrompt`.
