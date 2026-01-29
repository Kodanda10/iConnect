## 2024-12-17 - Prompt Injection Mitigation
**Vulnerability:** GenAI prompts constructed using string interpolation with user input are vulnerable to Prompt Injection, where malicious input can override instructions.
**Learning:** Using XML tags to delimit user input and sanitizing that input (escaping XML special characters) helps the model distinguish data from instructions.
**Prevention:** Always wrap user input in XML tags (e.g., `<user_input>...</user_input>`) and sanitize it before embedding in prompts.
