## 2026-06-10 - Prevent Prompt Injection in Greeting Generation
**Vulnerability:** Unsanitized user input (`request.name`, `request.leaderName`) was interpolated directly into generative AI prompts (Gemini).
**Learning:** Interpolating raw user input into AI prompts can lead to prompt injection or XSS via template interpolation.
**Prevention:** Always sanitize input by removing control characters, common prompt injection wrappers, and enforcing length limits before using it in generative prompts or templates.
