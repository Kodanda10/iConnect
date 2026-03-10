## 2024-12-16 - Hardcoded API Keys in Seed Scripts
**Vulnerability:** Firebase API keys were hardcoded directly in `iconnect-web/src/scripts/seed-tasks.ts`, `iconnect-web/src/scripts/seed-december.ts`, and `iconnect-web/src/scripts/seed-constituents.ts`. This poses a risk of secrets leaking if the repository becomes public or is shared improperly.
**Learning:** Seed scripts, often used for local development and testing, are frequently overlooked when securing configuration data. Developers may hardcode keys for convenience, bypassing environment variables used in the main application flow.
**Prevention:** Enforce the use of `dotenv` or similar tools in all scripts to read configuration from environment files (e.g., `.env.local`). Avoid committing any hardcoded secrets to version control.
