## 2025-02-18 - Prompt Injection Defense
**Vulnerability:** Prompt Injection in GenAI prompts. The `buildPrompt` function directly concatenated user input into the prompt string without sanitization or structure.
**Learning:** LLMs can be confused by user input that mimics instructions. Direct string interpolation is dangerous if the input is not clearly delimited.
**Prevention:** Use XML tags (e.g., `<name>`, `<instruction>`) to strictly separate user data from system instructions. Always sanitize user input to escape these delimiters (e.g., escaping `<` and `>`).
