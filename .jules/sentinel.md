
## 2025-02-18 - LLM Prompt Injection via User Input
**Vulnerability:** User-controlled inputs (`request.name`, `request.leaderName`) were interpolated directly into LLM prompts without sanitization, allowing prompt injection.
**Learning:** LLM prompts act similarly to SQL queries when interpolating user data, requiring robust sanitization (truncation, HTML/bracket stripping) and safe fallbacks to maintain grammatical structure if input is purely malicious.
**Prevention:** Always pass user data through a `sanitizeInput` utility before interpolation into generative AI prompts.
