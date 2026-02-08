## 2025-05-15 - Prompt Injection Mitigation
**Vulnerability:** Unsanitized user input in LLM prompts allowed for potential Prompt Injection.
**Learning:** Concatenating user input directly into prompts is dangerous. LLMs can be tricked into ignoring instructions.
**Prevention:** Use XML tags (e.g., `<user_input>...`) to delimit data from instructions and sanitize input (escape special characters) before insertion.
