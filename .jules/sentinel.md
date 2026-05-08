## 2026-05-08 - Prevent Prompt Injection via Input Sanitization
**Vulnerability:** Unsanitized user inputs (`name` and `leaderName`) were passed directly to the Gemini AI prompt and template strings, posing a risk for prompt injection and XSS.
**Learning:** In AI-integrated functions, user inputs must be aggressively sanitized (length limits, tag stripping, control character removal) before interpolation to maintain safety.
**Prevention:** Apply strict sanitization using utilities like `sanitizeInput` on all user-supplied variables before using them in AI prompts or rendering.
