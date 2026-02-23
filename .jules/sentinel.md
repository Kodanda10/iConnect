## 2024-12-18 - Prompt Injection in Greeting Generation
**Vulnerability:** The `generateGreetingMessage` function directly embedded user input (`name`, `leaderName`) into the LLM prompt, allowing potential prompt injection attacks.
**Learning:** LLMs are susceptible to "ignore previous instructions" attacks if user input is not strictly separated from system instructions.
**Prevention:**
1.  **Input Sanitization:** Escape special characters (XML/HTML entities) in user input.
2.  **Prompt Structure:** Use XML delimiters (e.g., `<instruction>`, `<data>`) to clearly separate system instructions from user data.
3.  **Validation:** Enforce strict length limits on all user inputs to prevent DoS.
