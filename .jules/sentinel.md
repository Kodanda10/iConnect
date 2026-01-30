## 2026-01-30 - Prompt Injection Defense with XML Tagging
**Vulnerability:** Detected potential for Prompt Injection in GenAI prompts where user input was directly concatenated into the system prompt.
**Learning:** Simple string interpolation allows malicious users to override system instructions (e.g., "Ignore previous instructions").
**Prevention:** Use XML-like tags (e.g., `<constituent_name>`) to strictly delimit user data from instructions, and explicitly instruct the model to treat content within those tags as data only. Always sanitize input to escape XML special characters (`<`, `>`, `&`).
