## 2026-02-21 - Prompt Injection in LLM Greeting Service
**Vulnerability:** The `generateGreetingMessage` function interpolated user input directly into an LLM prompt without sanitization or structure.
**Learning:** LLMs can be manipulated by malicious inputs ("Prompt Injection") to override system instructions if data is not clearly separated from control logic.
**Prevention:**
1. Sanitize user inputs (escape XML/HTML characters).
2. Use XML-like tags (e.g., `<data>...</data>`) to wrap user input in the prompt.
3. Explicitly instruct the model to treat the content within tags as data, not instructions.
