## 2025-02-28 - Removed Hardcoded Firebase Config from Seed Scripts
**Vulnerability:** Firebase API keys and project configurations were hardcoded directly in `seed-tasks.ts`, `seed-constituents.ts`, and `seed-december.ts`.
**Learning:** Even utility or seed scripts should never contain hardcoded credentials, as they can easily be committed to version control and exposed.
**Prevention:** Always use `dotenv` to load environment variables from a `.env` file (e.g., `.env.local`) for all scripts, consistent with application code.
