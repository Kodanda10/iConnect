## 2024-12-18 - Hardcoded Firebase API Key in Seed Scripts
**Vulnerability:** Firebase API Key was hardcoded in several seed scripts (seed-tasks.ts, seed-constituents.ts, seed-december.ts).
**Learning:** Hardcoding API keys in utility or seed scripts triggers automated credential scanners and exposes configuration details.
**Prevention:** Always use environment variables (e.g., process.env.NEXT_PUBLIC_FIREBASE_API_KEY) even in development/seed scripts.
