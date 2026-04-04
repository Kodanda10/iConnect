
## 2024-04-04 - [Prompt Injection in Generative AI Prompts]
**Vulnerability:** User inputs (like names) were directly interpolated into generative AI prompts and rendered back to the client, creating vectors for prompt injection and XSS.
**Learning:** Even if data is not stored in a database, passing unsanitized user strings into GenAI prompt templates can alter the AI's instructions or result in malicious HTML being echoed back to the client. If sanitization fully strips malicious input, falling back to the original string re-introduces the vulnerability.
**Prevention:** Aggressively sanitize user inputs (e.g., strip angle brackets and control characters) before interpolation into AI prompts or template fallbacks. If sanitization results in an empty string, always fallback to a safe generic string (like "the constituent") rather than the original input.
