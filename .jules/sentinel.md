## 2024-12-16 - Prevent Prompt Injection in AI Generative Functions
**Vulnerability:** User inputs (e.g. constituent names) were directly interpolated into Gemini AI generative prompts and static template fallbacks in `functions/src/greeting.ts` without sanitization, posing a risk of XSS and prompt injection.
**Learning:** Even internal tool workflows that use basic AI completions must sanitize all user inputs to prevent malicious actors from breaking out of the instruction boundaries or exploiting fallback templates.
**Prevention:** Implement and enforce a standard `sanitizeInput` utility that strips HTML tags and control characters. Ensure safe fallbacks (like default generic strings) are used if inputs are completely stripped by sanitization.
