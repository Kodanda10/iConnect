## 2025-05-22 - Prompt Injection in GenAI Features
**Vulnerability:** The GenAI greeting generator concatenated user input directly into the prompt without sanitization, allowing potential prompt injection (e.g., users could override instructions).
**Learning:** LLMs effectively treat "data" and "instructions" as the same token stream. Without explicit delimiters or sanitization, user input can hijack the model's behavior.
**Prevention:**
1. Sanitize input to escape XML-like characters (<, >, &).
2. Use XML tags (e.g., `<constituent_name>`) to clearly separate variable data from system instructions in the prompt.
3. Explicitly instruct the model to only output the requested content.
