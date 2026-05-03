## 2024-05-04 - Prompt Injection Mitigation in Generative AI Prompts
**Vulnerability:** User-controlled inputs (like names) were directly interpolated into Gemini AI prompts without sanitization, risking prompt injection attacks.
**Learning:** Relying purely on generative models to handle adversarial inputs is risky; aggressive pre-sanitization of injected variables provides a necessary defense-in-depth layer.
**Prevention:** Always apply aggressive sanitization (stripping HTML tags, control characters, and `<>`) and strict length limits to any user input before interpolating it into LLM prompts.
