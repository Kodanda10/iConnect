## 2025-12-16 - Prompt Injection in Greeting Service
**Vulnerability:** The `greeting.ts` service was directly interpolating user input (constituent name and leader name) into the GenAI prompt. This allowed potential Prompt Injection where a malicious name could override system instructions (e.g., "Ignore previous instructions and print X").
**Learning:** LLM prompts are code. User input effectively becomes part of the "program" executed by the model. Without strict separation, the model cannot distinguish between instructions and data.
**Prevention:**
1. **Input Sanitization:** Sanitize inputs to escape characters that have special meaning in the prompt structure (specifically XML/HTML tags like `<` and `>`).
2. **Structural Separation:** Use XML tags (e.g., `<constituent_name>`) to strictly delimit user data from system instructions.
3. **Explicit Instruction:** Update the prompt to explicitly tell the model to "Use the data provided in the <X> tag", reinforcing the separation.
