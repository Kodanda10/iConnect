## 2025-05-14 - Fix Prompt Injection in AI Greetings
**Vulnerability:** Unsanitized user inputs (name, leaderName) were directly passed to Gemini AI prompts, allowing potential prompt injection.
**Learning:** AI prompt generation must strictly sanitize and restrict the length of dynamic variables to prevent malicious actors from altering the AI instructions.
**Prevention:** Always use `sanitizeInput` on any user-provided strings before interpolating them into AI prompts.
