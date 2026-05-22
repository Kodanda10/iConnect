## 2025-12-17 - Prevent Prompt Injection in Greeting Generation
**Vulnerability:** User inputs (`request.name` and `request.leaderName`) in `functions/src/greeting.ts` are concatenated directly into the prompt string without validation or sanitization, opening the door to Prompt Injection.
**Learning:** GenAI models are susceptible to prompt injection when untrusted input is interpolated without strict boundaries. Input lengths must be capped, and special/control characters removed or escaped.
**Prevention:** Always implement an explicit input sanitization step specifically designed to neutralise or delimit untrusted inputs before interpolating them into a model prompt.
