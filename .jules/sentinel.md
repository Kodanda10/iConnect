## 2026-05-23 - Prompt Injection via Unsanitized Input in Gemini Prompt Interpolation
**Vulnerability:** User inputs (e.g. `request.name`, `request.leaderName`) were being directly interpolated into Gemini AI prompts without any sanitization in `functions/src/greeting.ts`.
**Learning:** Passing unsanitized user inputs into AI prompts enables prompt injection attacks, where malicious inputs can override instructions. It can also lead to downstream XSS/HTML injection if the unsanitized data propagates to UI layers.
**Prevention:** Always sanitize any untrusted user input before interpolating it into generative AI prompts (e.g., limit length, strip tags and control characters) using a utility like `sanitizeInput`.
