## 2024-08-20 - Hardcoded Secrets in Seed Scripts
**Vulnerability:** Found hardcoded Firebase API keys in multiple Node utility/seed scripts (e.g., `iconnect-web/src/scripts/seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** Hardcoded Firebase API keys directly in Node scripts bypass environment variable configurations, trigger automated credential scanners, and pose a security risk. While Firebase client API keys are public identifiers for client apps, embedding them in backend/utility scripts is poor practice.
**Prevention:** Always use environment variables (`process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) configured via `.env` files for Node utility scripts, ensuring proper `dotenv` initialization.
