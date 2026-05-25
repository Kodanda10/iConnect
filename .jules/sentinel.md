## 2026-05-25 - Prevent AI Prompt Injection in Greetings
**Vulnerability:** User inputs (name, leaderName) were directly interpolated into Gemini AI prompts in `functions/src/greeting.ts`, creating a prompt injection vulnerability.
**Learning:** Even internal or non-public facing AI features require aggressive input sanitization to prevent users from manipulating the LLM instructions.
**Prevention:** Always apply the `sanitizeInput` utility (limiting length and stripping HTML/control characters) to any user-provided string before inserting it into an AI prompt.
