## 2025-04-09 - Add sanitizeInput utility
**Vulnerability:** User inputs (e.g., constituent names, leader names, text content) passed directly to LLM prompts and templates without sanitization, posing Cross-Site Scripting (XSS) and prompt injection risks.
**Learning:** GenAI prompts and string interpolations must have data sanitized to strip unclosed tags, angle brackets, and control characters, mitigating prompt injection and injection attacks.
**Prevention:** Always use `sanitizeInput` to strip `<[^>]*>`, `<` and `>` brackets, and limit length before interpolating into templates or LLM prompts.
