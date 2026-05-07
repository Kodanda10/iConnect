## 2024-05-07 - Add Input Sanitization for AI Prompt
**Vulnerability:** Unsanitized user inputs (name, leaderName, ward) were being interpolated directly into Gemini AI prompts in `functions/src/greeting.ts`, exposing the system to potential prompt injection and HTML injection attacks.
**Learning:** The `sanitizeInput` utility was documented as a requirement in memory but was missing from `functions/src/utils/security.ts` and not actively integrated into the data flow.
**Prevention:** Always implement required security utilities and ensure they are actively applied to user inputs, especially before passing them to external systems like LLMs.
