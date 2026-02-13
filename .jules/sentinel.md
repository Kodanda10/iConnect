## 2025-05-20 - Prompt Injection Defense
**Vulnerability:** Prompt Injection in LLM Greeting Generation
**Learning:** Interpolating user input directly into LLM system prompts allows attackers to override instructions.
**Prevention:**
1. Sanitize all user inputs (escape XML/HTML chars).
2. Structure prompts using XML tags (e.g., `<instruction>`, `<data>`) to clearly separate logic from content.
3. Explicitly reference data fields in instructions.
