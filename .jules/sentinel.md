## 2024-12-16 - Node Utility Script Firebase API Keys
**Vulnerability:** Firebase client API keys were hardcoded directly in Node utility/seed scripts (`iconnect-web/src/scripts/*.ts`).
**Learning:** Although Firebase client API keys are public identifiers for client apps, hardcoding them directly into Node.js utility or seed scripts triggers automated credential scanners and creates unnecessary security posture alerts.
**Prevention:** Always replace hardcoded Firebase API keys with environment variables (e.g., `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) in server-side or utility Node scripts, explicitly loading them via `dotenv`.
