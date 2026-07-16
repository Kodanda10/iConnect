## 2025-02-12 - Remove Hardcoded Firebase Keys in Seed Scripts
**Vulnerability:** Hardcoded Firebase API keys in multiple TypeScript seed scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** Developers sometimes hardcode keys in local utility scripts to bypass complex environment setups, which can then be accidentally checked into version control.
**Prevention:** Ensure all utility scripts load configuration from environment variables (e.g., using `dotenv`) and never hardcode secrets, even in development or seeding scripts.
