## 2024-12-17 - Prompt Injection Vulnerability in Greeting Generation
**Vulnerability:** User-supplied names and leader names were inserted directly into GenAI prompts without sanitization or delimiting.
**Learning:** GenAI prompts are code. Untrusted input must be treated as potential code injection. In this app, names could contain instructions to override the greeting logic.
**Prevention:** Use XML delimiters (e.g., `<name>...</name>`) around variable inputs and sanitize them (escape `<`, `>`) to ensure the model interprets them as data, not instructions.
