## 2024-12-17 - GenAI Prompt Injection
**Vulnerability:** Unsanitized user input in `greeting.ts` allowed potential prompt injection attacks against the Gemini AI model.
**Learning:** LLM prompts are vulnerable to injection just like SQL. Concatenating strings without sanitization or structural boundaries (like XML tags) is risky.
**Prevention:** Always use `sanitizeInput` to strip tags and limit length. Structure prompts with XML delimiters (e.g., `<name>...</name>`) to clearly separate data from instructions.
