## 2024-08-14 - Hardcoded Firebase Client API Keys in Seed Scripts
**Vulnerability:** Hardcoded Firebase API keys in TypeScript seed scripts (iconnect-web/src/scripts/*.ts) triggering credential scanners.
**Learning:** Even though Firebase client API keys are public, embedding them directly into Node.js utility/seed scripts flags them as leaked secrets in automated tools and exposes project details unnecessarily.
**Prevention:** Always use environment variables (e.g., `process.env.NEXT_PUBLIC_FIREBASE_API_KEY` via `dotenv`) in utility scripts, instead of hardcoding API keys, to improve security posture and prevent scanner warnings.
