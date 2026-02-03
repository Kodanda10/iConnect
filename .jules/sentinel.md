## 2025-05-18 - GenAI Prompt Injection Mitigation

**Vulnerability:** The `buildPrompt` function in `functions/src/greeting.ts` directly interpolated user input into the prompt string without sanitization or structure. This allowed for Prompt Injection attacks where a malicious user could override instructions (e.g., via the `name` field).

**Learning:** When using LLMs, treating user input as trusted text within a prompt is dangerous. LLMs cannot distinguish between "system instructions" and "user data" unless explicit delimiters are used. A lack of structural separation makes the system susceptible to injection.

**Prevention:**
1.  **Sanitization:** Strip XML/HTML-like tags from user input to prevent "tag hijacking" (where a user inserts `</instruction>` to close the system block prematurely).
2.  **XML Delimiters:** Use XML tags (e.g., `<instruction>`, `<data>`, `<constraint>`) to clearly separate the system's instructions from the user's data. This helps the model understand boundaries.
