## 2025-01-28 - GenAI Prompt Injection
**Vulnerability:** User input was directly interpolated into an LLM prompt (`greeting.ts`), allowing potential instruction overrides.
**Learning:** LLMs treat all text as potential instructions. Unstructured string concatenation is vulnerable.
**Prevention:** Use XML/JSON tags to separate `<instruction>` from `<data>`, and explicitly tell the model to ignore instructions in data tags. Sanitize input to escape tag delimiters.
