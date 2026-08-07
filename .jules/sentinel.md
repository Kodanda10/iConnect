## 2024-12-16 - Hardcoded API keys in Seed Scripts
**Vulnerability:** Hardcoded Firebase API keys and secrets were found directly in the seed script source files (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** Seed scripts and developer utility scripts are often overlooked during security audits but are just as capable of exposing secrets if checked into source control.
**Prevention:** Use environment variables (via `dotenv` pointing to `.env.local` or similar) in all utility/seed scripts instead of hardcoding any sensitive configuration values.
