## 2025-05-18 - GenAI Prompt Injection Mitigation
**Vulnerability:** User input in GenAI prompts was concatenated directly, allowing potential Prompt Injection attacks where users could override instructions.
**Learning:** Simple string concatenation is insufficient for LLM prompts. Without delimiters, the model cannot distinguish between "instruction" and "data".
**Prevention:** Use XML tagging (e.g., `<instruction>`, `<data>`) to structurally separate components, AND sanitize user input (escape `<` `>` `&`) to prevent tag manipulation.
