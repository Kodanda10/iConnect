## 2026-06-08 - Prevent Prompt Injection in Greeting Generation
**Vulnerability:** Unsanitized user inputs (`name`, `leaderName`) were passed directly into the Gemini prompt in `greeting.ts`, exposing the app to prompt injection.
**Learning:** All user inputs interpolated into generative AI prompts must be sanitized to prevent malicious users from overriding AI instructions.
**Prevention:** Use a targeted `sanitizeInput` function to strip control characters and enforce length limits on all dynamic prompt variables.
