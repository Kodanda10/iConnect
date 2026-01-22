## 2026-01-22 - [GenAI Prompt Injection Defense]
**Vulnerability:** User input was directly concatenated into the prompt string in `functions/src/greeting.ts`, allowing malicious users to inject system instructions (Prompt Injection).
**Learning:** Even internal-facing AI prompts are vulnerable if they process user data. Simple "ignore instructions" directives are insufficient.
**Prevention:**
1. **Input Sanitization:** Strip control characters and escape XML/HTML special characters using a dedicated utility (`sanitizeInput`).
2. **Structural Separation:** Use XML tags (e.g., `<user_data>`) to clearly separate user input from system instructions.
3. **Explicit Instructions:** Instruct the model to ignore any instructions found within the data tags.
