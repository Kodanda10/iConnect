
## 2025-07-22 - Hardcoded Secrets in Scripts
**Vulnerability:** Hardcoded API keys in seed scripts.
**Learning:** Seed scripts sometimes bypass environment variables for convenience but this leaks secrets if pushed to the repo.
**Prevention:** Always use `dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });` or equivalent to load `.env` variables securely in seed scripts.
