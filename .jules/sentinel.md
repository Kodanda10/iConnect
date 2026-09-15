## 2025-01-20 - Hardcoded API keys in scripts
**Vulnerability:** Found hardcoded Firebase API keys in multiple utility scripts (seed-tasks.ts, seed-constituents.ts, seed-december.ts).
**Learning:** Utility/seeding scripts are often overlooked during security reviews, leaving secrets exposed in version control.
**Prevention:** Always use environment variables (e.g., dotenv) for secrets, even in local development or utility scripts.
