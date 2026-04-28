## 2025-04-28 - Prompt Injection in AI Greeting
**Vulnerability:** User-controlled input (name, leaderName) was passed directly to the Gemini AI prompt without sanitization.
**Learning:** In contexts where user input is embedded in prompts, aggressive sanitization (removing angle brackets, HTML tags, and control characters) and length limits are necessary to prevent prompt injection.
**Prevention:** Use sanitizeInput for all user-provided strings before inserting them into an AI prompt.
