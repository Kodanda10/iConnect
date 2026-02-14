## 2025-05-15 - Prompt Injection in Greeting Generation
**Vulnerability:** User input (`leaderName`, `name`) was directly interpolated into the Gemini AI prompt. Malicious input could override instructions.
**Learning:** LLMs are susceptible to prompt injection just like SQL injection. Input must be treated as untrusted.
**Prevention:** Sanitized input (HTML escaping) and used XML tags (`<instruction>`, `<recipient>`, `<sender>`) to structurally separate data from instructions.
