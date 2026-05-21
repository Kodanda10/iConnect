## 2026-05-21 - Prevent Prompt Injection via Input Sanitization
**Vulnerability:** Unsanitized user inputs (name, leaderName) were being directly interpolated into Gemini AI prompts in generateGreetingMessage.
**Learning:** Even though Gemini is a cloud service, prompt injection can lead to generating inappropriate content or bypassing prompt constraints. Input must always be sanitized before being used in AI prompts.
**Prevention:** Apply a robust sanitizeInput function that restricts input length and removes HTML tags and control characters for any user-provided string used in prompts.
