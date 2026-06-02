## 2026-06-02 - Prompt Injection Mitigation
**Vulnerability:** User-provided inputs (name, leaderName) were directly interpolated into generative AI prompts (Gemini) in `greeting.ts` without sanitization, posing a prompt injection risk.
**Learning:** AI prompt interfaces need explicit input sanitization, even if the primary data source is internal, as dynamic content can be manipulated to override AI instructions.
**Prevention:** Always use `sanitizeInput` to strip HTML, control characters, and limit length before interpolating variables into AI prompts.
