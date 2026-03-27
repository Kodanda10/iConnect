
## 2024-12-20 - Prevent AI Prompt Injection and XSS in Greetings
**Vulnerability:** User-controlled fields (`name` and `leaderName`) were directly interpolated into Gemini AI prompts and greeting templates. This exposed the application to prompt injection (e.g., users writing "Ignore previous instructions") and XSS via the template fallback.
**Learning:** Generative AI prompts that interpolate untrusted user data require sanitization to prevent the AI model from being manipulated. Additionally, falling back to original inputs (`sanitize(input) || input`) re-introduces vulnerabilities if the malicious payload is fully stripped.
**Prevention:** Use `sanitizeInput` from `utils/security.ts` to strip HTML tags and control characters before interpolating variables into AI prompts. If the resulting string is empty, fallback to a safe static generic identifier like `'the constituent'` or `'the leader'` to preserve grammar and security.
