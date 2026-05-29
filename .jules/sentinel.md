## 2026-05-29 - Hardcoded Firebase Configs
**Vulnerability:** Hardcoded Firebase API keys and project config found in seed scripts.
**Learning:** Developers sometimes hardcode secrets in scripts to bypass environment setup locally, which risks committing them to the repository.
**Prevention:** Use dotenv to load variables from a local .env file instead of hardcoding.
