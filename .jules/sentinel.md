## 2025-02-28 - Removed Hardcoded Firebase API Keys from Seeding Scripts
**Vulnerability:** Hardcoded Firebase API keys were found in `seed-tasks.ts`, `seed-constituents.ts`, and `seed-december.ts`.
**Learning:** Utility scripts are often overlooked during code review for hardcoded credentials, especially when copied and pasted for quick data generation.
**Prevention:** Always use environment variables for sensitive data, even in development or utility scripts, leveraging `dotenv` to load `.env.local`.
