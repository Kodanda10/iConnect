
## 2024-04-22 - [Fix prompt injection vulnerability in greeting generation]
**Vulnerability:** User inputs (`request.name` and `request.leaderName`) in `functions/src/greeting.ts` were passed unsanitized into Gemini prompts and fallback templates, leading to potential prompt injection or unclosed tag XSS.
**Learning:** Required input validation checks were originally performed on the raw input. If sanitization applies a default generic string fallback on completely stripped malicious inputs (e.g., `request.name = sanitizeInput(name) || 'the constituent'`), it must be done *after* validation or in a separate safe object clone so it doesn't mask empty inputs and bypass required validations.
**Prevention:** Always validate original input before transforming or applying default fallbacks to it to ensure required fields enforce their contract accurately. Also, consider creating a separate safe cloned object for transformed values to keep original inputs intact for other downstream checks.
