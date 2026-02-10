## 2024-12-18 - Prompt Injection in GenAI Greeting Service
**Vulnerability:** The `buildPrompt` function in `functions/src/greeting.ts` was directly interpolating user input (`name`, `leaderName`) into the LLM prompt without sanitization or structural separation. This allowed potential prompt injection attacks where malicious names could alter the model's behavior.
**Learning:** When using GenAI APIs, simple string concatenation is unsafe as models cannot distinguish between developer instructions and user data.
**Prevention:** Use XML-based structural delimiters (e.g., `<recipient_name>`) to strictly separate instructions from data. Sanitize all user inputs (escape `<`, `>`, `&`) to prevent tag injection, and explicitly instruct the model to ignore instructions found within data tags.
