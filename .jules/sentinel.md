## 2024-09-20 - Hardcoded Firebase API Key Removal
**Vulnerability:** Hardcoded Firebase API keys found in multiple TS seed scripts in the `iconnect-web` workspace.
**Learning:** Seed scripts often bypass standard configuration flows, leading to hardcoded secrets that get committed to the repository.
**Prevention:** Always utilize `dotenv` and `process.env` to load credentials in local utility scripts, matching the environment-based configuration used in production.
