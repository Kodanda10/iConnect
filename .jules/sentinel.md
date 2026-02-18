## 2026-02-18 - Prompt Injection in GenAI Greetings
**Vulnerability:** User inputs (`name`, `leaderName`) were directly interpolated into the GenAI prompt string without sanitization or structural separation. This allowed potential prompt injection attacks where a malicious user could override the system instructions.
**Learning:** LLMs treat all text in the prompt as potential instructions unless clearly delimited. Simple string concatenation is insufficient for security when dealing with untrusted input in prompts.
**Prevention:** Always sanitize user inputs (escape XML/HTML characters) and use structured prompts (e.g., XML tags like `<instruction>`, `<data>`) to explicitly separate system instructions from user data.
