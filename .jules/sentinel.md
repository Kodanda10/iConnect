
## 2024-05-24 - [Prompt Injection Mitigation]
**Vulnerability:** Prompt injection and XSS vulnerability found in greeting generation. User input variables `request.name` and `request.leaderName` were being injected directly into the Gemini AI prompt template in `functions/src/greeting.ts` without validation.
**Learning:** Even internal AI prompts generated for internal purposes can be vulnerable to prompt injection if they utilize unsanitized external user data, which can break the template layout, cause unexpected output, or act maliciously.
**Prevention:** Use a `sanitizeInput` function (added in `functions/src/utils/security.ts`) that removes control characters, reduces multiple spaces, and restrains length to sanitize data before injecting it into any prompt string.
