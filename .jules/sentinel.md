## 2024-05-22 - Prompt Injection in LLM Features
**Vulnerability:** User input (e.g., recipient names) was directly interpolated into the LLM prompt without sanitization or structural boundaries, allowing users to potentially manipulate the generation instructions (Prompt Injection).
**Learning:** LLMs are highly susceptible to instruction following from any source, including user data. Relying on "Do not do X" in plain text is insufficient when user data is mixed freely with instructions.
**Prevention:**
1.  **Strict Separation:** Use XML-like tags (e.g., `<recipient_name>`) to encapsulate user data.
2.  **Explicit Instruction:** Tell the model to *only* treat content within those tags as data and ignore instructions found therein.
3.  **Sanitization:** Escape special characters (`<`, `>`, etc.) in user input to prevent tag injection/breakout.
