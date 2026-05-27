## 2026-05-27 - Prevent Prompt Injection in AI Greetings
**Vulnerability:** User inputs (name, leaderName) directly interpolated into Gemini AI prompt without sanitization.
**Learning:** Unsanitized inputs allow prompt injection, potentially tricking the AI into inappropriate responses.
**Prevention:** Use sanitizeInput before interpolation to remove HTML and restrict length.
