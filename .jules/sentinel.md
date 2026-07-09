## 2025-01-20 - Hardcoded API Keys in Scripts
**Vulnerability:** Hardcoded Firebase API keys were found in database seeding scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** Even internal utility and seeding scripts must follow security standards and not include hardcoded sensitive credentials, as these files are committed to version control.
**Prevention:** Always use environment variables (`process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) configured in `.env` files for authentication and database configurations across the entire repository.
