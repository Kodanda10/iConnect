## 2025-01-20 - Input Sanitization for LLM Prompts
**Vulnerability:** Unsanitized user inputs (name, leaderName, ward) were interpolated directly into the Gemini LLM prompt in `greeting.ts`, risking prompt injection or unintended generation behaviors.
**Learning:** In applications integrating LLMs, user inputs must be aggressively sanitized (e.g., stripping control chars and HTML tags, limiting length) *before* being included in prompt templates to mitigate prompt injection risks.
**Prevention:** Always apply a dedicated `sanitizeInput` utility to all user-controlled variables before interpolating them into LLM prompts.
