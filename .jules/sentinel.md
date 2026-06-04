## 2026-06-04 - Prevent Prompt Injection in AI Greetings
**Vulnerability:** User inputs (name, leaderName) were being passed unsanitized into the Gemini AI prompt and fallback templates, creating a risk for prompt injection or basic XSS/HTML injection if displayed later.
**Learning:** AI prompt interpolations require the same level of input sanitization as database queries to prevent malicious instructions.
**Prevention:** Apply a strict `sanitizeInput` utility that strips HTML tags, control characters, and limits length on all variables interpolated into AI prompts.
