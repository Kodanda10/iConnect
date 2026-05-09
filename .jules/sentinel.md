## 2026-05-09 - Prompt Injection Mitigation
**Vulnerability:** Unsanitized user inputs (name, leaderName) were being directly interpolated into AI prompts for Gemini, risking prompt injection and XSS in generated greetings.
**Learning:** In a context where external AI models process free-text inputs, the inputs act like queries and require strict sanitization (length limits, stripping tags/control chars) to prevent adversarial prompt manipulation.
**Prevention:** Always apply the `sanitizeInput` utility to variables before interpolating them into prompts or dynamic templates.
