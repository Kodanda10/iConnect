
## 2025-02-28 - Hardcoded Firebase API Keys in Seed Scripts
**Vulnerability:** Found hardcoded Firebase `apiKey` and configuration objects in `iconnect-web/src/scripts/seed-tasks.ts`, `seed-constituents.ts`, and `seed-december.ts`.
**Learning:** Seed scripts often get copied from tutorials and include hardcoded dev credentials. Even for non-production environments, credentials should not be committed directly into version control as they may end up pointing to real databases or expose the project to quota abuse.
**Prevention:** Always use environment variables (e.g. `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) for Firebase initialization, even in utility scripts.
