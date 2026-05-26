
## 2026-05-26 - Prevent Prompt Injection in Greeting Generation
**Vulnerability:** User inputs (name, leaderName) were being directly interpolated into Gemini AI prompts without sanitization, risking prompt injection attacks.
**Learning:** In AI-integrated functions, all user inputs must be strictly sanitized to prevent unclosed tag XSS and prompt injection.
**Prevention:** Apply `sanitizeInput` utility on all user inputs before they are passed to AI models.
