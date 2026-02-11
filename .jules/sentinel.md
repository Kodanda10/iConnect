# Sentinel Journal - Critical Security Learnings

## 2026-02-11 - Prompt Injection Defense
**Vulnerability:** User inputs (`name`, `leaderName`) were directly concatenated into LLM prompts in `greeting.ts`, allowing potential prompt injection.
**Learning:** The project lacked a basic `sanitizeInput` utility for HTML/XML escaping, which is critical for defending against prompt injection.
**Prevention:** Always use `sanitizeInput` to escape special characters and structure LLM prompts using XML delimiters (e.g., `<instruction>`, `<recipient_name>`) to clearly separate instructions from user-provided data.
