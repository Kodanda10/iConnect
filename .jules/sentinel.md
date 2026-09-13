## 2024-09-13 - Replace Hardcoded Firebase Secrets
**Vulnerability:** Hardcoded API keys in Node scripts (`iconnect-web/src/scripts/seed-tasks.ts`, `iconnect-web/src/scripts/seed-constituents.ts`, `iconnect-web/src/scripts/seed-december.ts`).
**Learning:** Hardcoding API keys into Node utility or seed scripts triggers automated credential scanners, even if they're considered public identifiers for client apps.
**Prevention:** Always replace hardcoded secrets with environment variables in Node scripts, e.g., using `process.env.NEXT_PUBLIC_FIREBASE_API_KEY` and configuring `dotenv`.
