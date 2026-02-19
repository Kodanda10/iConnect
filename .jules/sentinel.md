## 2026-02-19 - Prompt Injection in Greeting Service
**Vulnerability:** The `generateGreetingMessage` function constructed LLM prompts by directly interpolating user input (name, leaderName) without sanitization or structural delimiters. This allowed potential prompt injection where a malicious name could override system instructions.
**Learning:** LLMs treat all input as tokens. Without clear structural boundaries (like XML tags) or "system" role separation, user data is interpreted with the same authority as the system prompt.
**Prevention:**
1. Use XML delimiters (e.g., `<instruction>`, `<data>`) to structure prompts.
2. Explicitly instruct the model to treat content within data tags as data only.
3. Sanitize user inputs to escape the delimiter characters (e.g., `<` -> `&lt;`) before injection.
