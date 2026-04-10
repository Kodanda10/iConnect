## 2025-12-17 - Prompt Injection and XSS via GenAI Integration

**Vulnerability:** The Gemini API prompt builder in `functions/src/greeting.ts` did not sanitize user input (e.g., `name`, `leaderName`), allowing potential prompt injection. Furthermore, the fallback template mechanism directly interpolated unsanitized input, leading to potential Cross-Site Scripting (XSS) if the fallback message was displayed without further encoding in the frontend.

**Learning:** When using sanitization functions that aggressively strip content (like `sanitizeInput` which removes all `<...>` tags), falling back to the original string (`sanitizeInput(name) || name`) re-introduces the vulnerability if the input consists entirely of malicious stripped content.

**Prevention:** Always sanitize user input before interpolating it into prompts or templates. If sanitization results in an empty string, provide a safe, generic fallback (like `'the constituent'`) to maintain grammatical structure without compromising security.
