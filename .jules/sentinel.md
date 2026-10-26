## 2024-10-26 - Found hardcoded Firebase API keys in seeding scripts
**Vulnerability:** Hardcoded Firebase API keys and secrets were found in multiple testing/seeding scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** Even though testing and seeding scripts aren't meant for production, they often end up in version control and can expose credentials.
**Prevention:** Always use environment variables for API keys and configuration, even in local/testing scripts. Ensure scripts read from `.env` or process environment.
