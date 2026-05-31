## 2026-05-31 - Prevent Prompt Injection in AI Greetings
**Vulnerability:** User inputs (name, leaderName) were directly interpolated into Gemini AI prompts without sanitization, risking prompt injection and XSS.
**Learning:** AI prompt generation must treat all external variables as untrusted input.
**Prevention:** Always sanitize inputs interpolated into generative AI prompts by restricting length and removing HTML/control characters.
