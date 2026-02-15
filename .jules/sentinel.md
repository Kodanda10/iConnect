## 2025-05-21 - Prompt Injection Vulnerability in Greeting Generation

**Vulnerability:** The `generateGreetingMessage` function in `functions/src/greeting.ts` was directly interpolating user input (`name` and `leaderName`) into the LLM prompt. This allowed for Prompt Injection attacks where a malicious user could potentially override the instructions given to the AI model by crafting a specific name (e.g., "Ignore previous instructions...").

**Learning:** When using Large Language Models (LLMs), user input must never be treated as trusted text within the prompt. Concatenating user strings directly with instructions blurs the line between "code" (instructions) and "data" (user input), similar to SQL Injection.

**Prevention:**
1.  **Sanitize Input:** Escape special characters that might be interpreted by the model or downstream systems.
2.  **Use Delimiters:** Use XML-style tags (e.g., `<instruction>`, `<recipient>`, `<sender>`) to clearly separate instructions from data. This helps the model distinguish what it should *do* from what it should *process*.
3.  **Explicit Instructions:** Explicitly instruct the model to treat content within specific tags as data only.
