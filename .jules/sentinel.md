## 2025-02-14 - Hardcoded Firebase Credentials in Scripts
**Vulnerability:** Hardcoded Firebase API keys and credentials were found in multiple utility/seed scripts (e.g. `seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** These scripts can trigger automated credential scanners and expose credentials in source control.
**Prevention:** Always use environment variables (e.g., `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) to store and access secrets in scripts.
