## 2024-12-17 - Prompt Injection in Greeting Generation
**Vulnerability:** The `generateGreeting` function constructed LLM prompts by directly concatenating user input (`name`, `leaderName`) without sanitization or clear delimiters. This allowed potential prompt injection where malicious input could override system instructions.
**Learning:** LLMs do not inherently distinguish between "instructions" and "data" in a flat text prompt.
**Prevention:**
1. **Sanitize Input:** Escape XML/HTML special characters in user input before including it in the prompt.
2. **Structure Prompts:** Use XML tags (e.g., `<instruction>`, `<data>`) to clearly delimit system instructions from user data, and explicitly instruct the model to ignore instructions within data tags.
