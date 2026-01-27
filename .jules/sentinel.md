## 2024-05-22 - Prompt Injection in GenAI Functions
**Vulnerability:** User inputs were directly concatenated into the Gemini AI prompt in `functions/src/greeting.ts` without sanitization or delimitation, allowing potential prompt injection.
**Learning:** GenAI prompts are vulnerable to injection just like SQL queries. Concatenating strings is dangerous.
**Prevention:** Always sanitize user inputs (escape XML/HTML characters) and wrap them in XML tags (e.g., `<user_input>...`) within the prompt to clearly distinguish data from instructions. Added `sanitizeInput` to `functions/src/utils/security.ts` for this purpose.
