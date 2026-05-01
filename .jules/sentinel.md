## 2025-05-01 - Fix hardcoded Firebase API keys in seed scripts
**Vulnerability:** Hardcoded Firebase `apiKey` and other configuration details were committed directly within `iconnect-web/src/scripts/seed-tasks.ts`, `seed-constituents.ts`, and `seed-december.ts`.
**Learning:** Seed scripts often connect to production or development databases directly, making them common places where developers unintentionally hardcode credentials for convenience, bypassing environment variable practices.
**Prevention:** Always ensure utility or seed scripts use `dotenv` (or similar) to load `.env` variables instead of hardcoding credentials, and verify these scripts in security scans.
