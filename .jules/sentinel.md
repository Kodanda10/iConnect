## 2024-07-30 - Fix Hardcoded Firebase API Key
**Vulnerability:** Found hardcoded Firebase API keys in multiple database seed scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** Seed scripts often bypass the standard configuration flow and may hardcode credentials for convenience, which risks exposing sensitive information if pushed to version control.
**Prevention:** Ensure all standalone and utility scripts utilize `dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })` to securely load environment variables instead of embedding them directly in the code.
