## 2025-04-23 - [Prompt Injection fix]
**Vulnerability:** User inputs (name, leaderName) were directly interpolated into generative AI prompts without sanitization.
**Learning:** This exposes the application to prompt injection and XSS attacks if malicious users supply carefully crafted names containing HTML tags, standalone angle brackets, or control characters.
**Prevention:** Always sanitize user inputs before inclusion in AI prompts. Use safe fallbacks (e.g. `'the constituent'`) if the sanitization strips all the input, rather than falling back to the original input. Ensure input sanitization logic strips out control characters and limits the input length to a reasonable amount.
