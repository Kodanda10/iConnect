## 2025-01-20 - Remove hardcoded API keys from Node seed scripts
**Vulnerability:** Hardcoded Firebase API keys in Node.js utility/seed scripts (iconnect-web/src/scripts/*.ts).
**Learning:** Although Firebase client keys are public identifiers and shouldn't be replaced in client apps, hardcoding them directly in Node utility or seed scripts triggers automated credential scanners and presents a poor security posture for server-side code.
**Prevention:** Always use environment variables (e.g., process.env.NEXT_PUBLIC_FIREBASE_API_KEY) loaded via dotenv in Node scripts, instead of hardcoding credentials, even for public keys.
