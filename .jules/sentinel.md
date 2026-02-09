## 2025-01-28 - Prompt Injection in AI Greetings
**Vulnerability:** User inputs (`name`, `leaderName`) were directly concatenated into the AI prompt without sanitization or structural separation, allowing malicious users to override instructions (Prompt Injection).
**Learning:** LLM prompts must treat user input as untrusted data, similar to SQL queries. Plain text concatenation is insecure.
**Prevention:** Use XML tagging (e.g., `<data>... </data>`) to structure prompts and explicitly instruct the model to treat tagged content as data. Always sanitize input to escape XML special characters (`<`, `>`, `&`).
