## 2026-08-16 - Prevent hardcoded Firebase API Keys in utility scripts
**Vulnerability:** Hardcoded Firebase client API keys found in Node utility scripts (iconnect-web/src/scripts/*.ts).
**Learning:** Even though Firebase client API keys are public, hardcoding them directly into scripts triggers automated credential scanners and is poor practice.
**Prevention:** Always use environment variables (e.g., process.env.NEXT_PUBLIC_FIREBASE_API_KEY) to inject API keys into utility scripts.
