## 2024-12-17 - Sanitization in AI Prompts
**Vulnerability:** User-controlled input (names and leader names) was interpolated directly into generative AI prompts without sanitization, creating a prompt injection risk.
**Learning:** Generative AI inputs must be sanitized just like SQL inputs to prevent malicious prompt instructions.
**Prevention:** Always use the `sanitizeInput` utility before interpolating user data into AI prompts.
