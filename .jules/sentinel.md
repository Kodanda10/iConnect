## 2026-08-20 - Remove hardcoded API keys in Node scripts
**Vulnerability:** Hardcoded Firebase client API keys directly into Node utility/seed scripts triggers automated credential scanners.
**Learning:** Although Firebase client API keys are generally considered public identifiers and shouldn't be replaced in client apps, hardcoding them directly into Node utility or seed scripts triggers automated credential scanners.
**Prevention:** In these scripts, you should always replace them with environment variables (e.g., process.env.NEXT_PUBLIC_FIREBASE_API_KEY) to improve security posture.
