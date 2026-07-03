## 2026-07-03 - Fix hardcoded API keys in seed scripts
**Vulnerability:** Hardcoded Firebase API keys in seed scripts.
**Learning:** Seed scripts often bypass main application configuration and mistakenly hardcode credentials for convenience, which exposes them to source control.
**Prevention:** Use environment variables and proper configuration loading even in auxiliary scripts like seeders or data migrations.
