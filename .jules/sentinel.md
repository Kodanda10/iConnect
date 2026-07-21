## 2024-05-24 - Hardcoded Firebase Config in Scripts
**Vulnerability:** Found hardcoded Firebase API keys and project config in multiple seed scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`) in `iconnect-web/src/scripts/`.
**Learning:** Seed scripts are sometimes written quickly and copy-pasted with hardcoded secrets instead of properly reading from environment variables like the main application does. Even test or staging API keys should never be hardcoded.
**Prevention:** Always use `dotenv` to load `.env.local` or environment variables for scripts instead of hardcoding sensitive config, matching the practice in `lib/firebase.ts`.
