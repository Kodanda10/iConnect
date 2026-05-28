## 2026-05-28 - Prevent AI Prompt Injection in Greeting Generation
**Vulnerability:** User inputs (name, leaderName) were directly interpolated into Gemini AI prompts without sanitization, allowing potential prompt injection attacks.
**Learning:** External API prompts must always treat user input as untrusted. AI models are susceptible to instruction overrides if input is not sanitized or constrained.
**Prevention:** Implement and enforce a strict `sanitizeInput` utility that limits length, removes HTML/control characters, and use it whenever interpolating user data into AI prompts.
