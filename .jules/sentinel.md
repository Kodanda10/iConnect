## 2024-12-18 - Prompt Injection in Greeting Service
**Vulnerability:** User input (`name`, `leaderName`) was directly interpolated into the LLM prompt without sanitization or delimiting. A malicious user could inject instructions to override the system prompt.
**Learning:** Even simple string interpolation for GenAI prompts is risky. "Instruction/Context" separation using XML tags is a robust pattern for this codebase.
**Prevention:** Always use `sanitizeInput` (XML escaping) for user data and wrap data in XML tags (`<data>...</data>`) when building prompts.
