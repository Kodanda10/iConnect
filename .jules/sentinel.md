## 2025-02-14 - Hardcoded Secrets in Seed Scripts
**Vulnerability:** Hardcoded Firebase API keys found in multiple seed scripts (`iconnect-web/src/scripts/`).
**Learning:** Seed and utility scripts are often overlooked and can leak secrets if they don't load environment variables properly.
**Prevention:** Always use `dotenv.config()` to read environment variables in utility scripts instead of hardcoding API keys.
