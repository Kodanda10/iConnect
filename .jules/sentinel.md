# Sentinel's Security Journal 🛡️

## 2026-02-02 - Prompt Injection Mitigation in Greeting Service
**Vulnerability:** The `generateGreetingMessage` function in `greeting.ts` used simple string interpolation for GenAI prompts, allowing malicious names to inject instructions (Prompt Injection).
**Learning:** Even internal helper functions like `buildPrompt` should treat user input as untrusted. "Sanitization" for LLMs often means structured prompting (XML tags) + escaping special characters to separate instructions from data.
**Prevention:** Always use the XML-delimited prompt pattern (`<instruction>`, `<context>`) and the `sanitizeInput` utility for any variable data sent to an LLM.
