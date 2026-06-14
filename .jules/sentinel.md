## 2026-06-14 - Prompt Injection Vulnerability
**Vulnerability:** Unsanitized user input (`request.name`, `request.leaderName`) was directly passed to the Gemini AI API in `functions/src/greeting.ts`.
**Learning:** This exposes the application to prompt injection vulnerabilities where attackers could inject instructions to manipulate AI outputs.
**Prevention:** Created a `sanitizeInput` utility and used it to filter AI prompt inputs in `greeting.ts`.
