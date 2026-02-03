# Sentinel Journal - Critical Security Learnings

This journal tracks critical security learnings, vulnerabilities, and patterns specific to this codebase.

## Format
## YYYY-MM-DD - [Title]
**Vulnerability:** [What you found]
**Learning:** [Why it existed]
**Prevention:** [How to avoid next time]

## 2024-05-22 - GenAI Prompt Injection
**Vulnerability:** Unsanitized user input (`request.name`, `request.leaderName`) was directly interpolated into the GenAI prompt string.
**Learning:** Even internal backend functions are vulnerable to prompt injection if they process user data. Simple string interpolation is insufficient for LLM prompts.
**Prevention:** Use XML-delimited prompts (`<instruction>`, `<data>`) and sanitize all user input (escape `<` `>`) to prevent context hijacking.
