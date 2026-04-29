## 2024-04-29 - [Prevent Prompt Injection in Generative AI]
**Vulnerability:** User input used in Gemini AI prompt without sanitization
**Learning:** User input must be sanitized and limited in length before interpolation into prompts to prevent prompt injection
**Prevention:** Always sanitize inputs and apply a fallback if the input is entirely stripped
