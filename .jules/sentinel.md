## 2025-03-14 - Prevent Prompt Injection in Greeting Service
**Vulnerability:** Unsanitized constituent names and leader names were directly interpolated into generative AI prompts (Gemini) in `functions/src/greeting.ts`, opening the door for prompt injection.
**Learning:** Any user-controlled data that is incorporated into an LLM prompt must be properly sanitized by stripping HTML tags and control characters to prevent prompt manipulation or XSS when falling back to templates.
**Prevention:** Use a standard `sanitizeInput` function from `functions/src/utils/security.ts` on all optional and required text inputs. When sanitization strips all content, fallback to a safe generic string like 'the constituent' to maintain sentence grammatical structure without reintroducing vulnerabilities.
