## 2026-08-08 - Removed Hardcoded Firebase Config from Seed Scripts
**Vulnerability:** Hardcoded Firebase API keys and configuration in `seed-constituents.ts`, `seed-tasks.ts`, and `seed-december.ts`.
**Learning:** Developers sometimes hardcode config in utility scripts for convenience, bypassing environment variable management used in the main application.
**Prevention:** Always use `dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })` in Node.js utility scripts to securely load configuration from environment variables.
