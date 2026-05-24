## 2026-05-24 - Prevent Prompt Injection in AI Greetings
**Vulnerability:** User inputs were concatenated directly into Gemini AI prompts without sanitization, risking prompt injection.
**Learning:** AI prompt generation must treat user input as untrusted and sanitize it to prevent manipulation of AI output.
**Prevention:** Always apply aggressive sanitization (like stripping HTML, removing control characters, and limiting length) to inputs before interpolating them into LLM prompts.
