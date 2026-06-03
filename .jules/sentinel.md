## 2026-06-03 - Prompt Injection Vulnerability in Greeting Service
**Vulnerability:** Unsanitized user inputs (name, leaderName) were being directly interpolated into Gemini AI prompts.
**Learning:** This exposes the AI to prompt injection attacks if malicious input is provided, potentially leading to unintended AI behavior or data exposure.
**Prevention:** Always sanitize user-provided inputs (restricting length and removing control characters/tags) before passing them to LLM APIs.
