## 2025-01-21 - Remove Hardcoded Firebase API Keys from Node Scripts
**Vulnerability:** Hardcoded Firebase client API keys in Node seed scripts trigger automated credential scanners.
**Learning:** While Firebase client keys are safe to embed in client-side apps, hardcoding them directly into backend utility scripts creates security scanner noise and violates secrets management policies.
**Prevention:** Always use environment variables (e.g., `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) for configuring Firebase in server/Node environments.
