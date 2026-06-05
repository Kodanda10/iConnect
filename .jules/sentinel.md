## 2026-06-05 - Prevent Prompt Injection
**Vulnerability:** Generative AI prompt injection and potential HTML injection via unescaped user inputs.
**Learning:** User inputs (`request.name`, `request.leaderName`) were concatenated directly into Gemini AI prompts and templates.
**Prevention:** Always use a sanitization utility (e.g., `sanitizeInput`) to remove HTML tags, limit length, and strip control characters before interpolating variables into AI prompts.
