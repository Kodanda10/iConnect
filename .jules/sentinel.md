## 2024-08-06 - Hardcoded API Key in Scripts
**Vulnerability:** Hardcoded API Key (`apiKey`) found in three database seed scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** Even utility and seed scripts shouldn't have hardcoded secrets, as they are often committed to version control and run in shared environments, risking exposure of the Firebase database if rules are permissive or if used for other sensitive operations.
**Prevention:** Use environment variables (via `dotenv`) in standalone node scripts, similar to the main Next.js app, loading secrets securely from `.env.local` or environment injections.
