## 2026-05-20 - Prevent Prompt Injection in AI Greetings
**Vulnerability:** User inputs (name, leaderName) were passed directly to Gemini AI prompts without sanitization, risking prompt injection and potential XSS if the generated text is rendered unsafely.
**Learning:** AI prompt inputs need aggressive sanitization just like database queries, particularly removing control characters and HTML tags.
**Prevention:** Always use the `sanitizeInput` utility on any user-provided strings before interpolating them into AI prompts.
