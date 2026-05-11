## 2024-12-15 - Prompt Injection Mitigation in AI Endpoints
**Vulnerability:** Unsanitized user inputs (name, leaderName, ward) were interpolated directly into the Gemini AI prompt, leading to potential prompt injection and data exfiltration or undesirable behavior.
**Learning:** All inputs, even seemingly innocuous ones like names, must be strictly length-limited and sanitized when interpolated into AI prompts to prevent model confusion or malicious instructions.
**Prevention:** Apply strict sanitization (removing HTML/control characters, enforcing length limits) immediately after basic validation, but before utilizing data in sensitive operations like AI prompts.
