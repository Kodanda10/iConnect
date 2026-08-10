## 2025-01-01 - Hardcoded API Keys in Seed Scripts
**Vulnerability:** Hardcoded Firebase API keys in seed scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`)
**Learning:** Hardcoding API keys even in utility scripts exposes them and can trigger automated credential scanners. While Firebase client API keys are public identifiers, it's safer to read them from environment variables to avoid credential alerts.
**Prevention:** Always use environment variables in scripts (e.g. via `dotenv`) and never commit plaintext credentials directly to the repository.
