## 2026-06-01 - Prompt Injection via Unsanitized Input
**Vulnerability:** User inputs (name, leaderName) were directly interpolated into AI prompts without sanitization.
**Learning:** Unsanitized inputs interpolated into generative AI prompts create high risk for prompt injection.
**Prevention:** Always restrict input length and aggressively remove tags and control characters using sanitizeInput before interpolation.
