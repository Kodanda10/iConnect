
## 2025-02-18 - Hardcoded Firebase API Key in Seed Scripts
**Vulnerability:** A hardcoded Firebase API Key (`AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8`) was found in multiple Firestore seed scripts (`iconnect-web/src/scripts/seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** Seed scripts or testing scripts are sometimes overlooked during security reviews, leaving sensitive credentials like API keys hardcoded. Even if it's a test environment or "just a seed script", it can still leak sensitive application configuration or be inadvertently pushed to public repositories.
**Prevention:** Always load configuration variables from environment files (e.g., `.env.local`) using libraries like `dotenv` for all scripts, including temporary/seed scripts, to keep credentials out of version control.
