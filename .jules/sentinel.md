## 2026-06-11 - Prompt Injection in Gemini Greeting Generator
**Vulnerability:** Unsanitized user inputs (request.name, request.leaderName) were directly interpolated into Gemini prompts.
**Learning:** Dynamic user inputs in AI prompts can be used to inject instructions, bypassing intended logic.
**Prevention:** Always sanitize inputs with a targeted denylist removing control characters and injection syntax before interpolating into prompts.
