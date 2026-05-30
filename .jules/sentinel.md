## 2026-05-30 - Prevent Prompt Injection via Input Sanitization
**Vulnerability:** User-provided inputs (name, leaderName) were directly interpolated into Gemini AI prompts without length limits or character sanitization.
**Learning:** Unsanitized interpolation in AI prompts exposes the application to prompt injection and XSS via unclosed tags.
**Prevention:** Always restrict input length and aggressively remove HTML tags and control characters before passing data to generative AI models.
