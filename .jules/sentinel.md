## 2025-05-18 - Prompt Injection in GenAI Greeting

**Vulnerability:** The `buildPrompt` function in `functions/src/greeting.ts` was vulnerable to prompt injection because it directly concatenated user-provided names into the prompt string without sanitization or structural delimiters.

**Learning:** When using GenAI APIs, treating user input as trusted text within a prompt can allow attackers to override instructions. Simple string concatenation is insufficient for security.

**Prevention:** Implemented a `sanitizeInput` utility in `functions/src/utils/security.ts` to escape XML/HTML special characters. Updated prompts to use XML tags (e.g., `<instruction>`, `<recipient_name>`) to clearly separate system instructions from user data, a pattern that should be reused for all future LLM integrations in this project.
