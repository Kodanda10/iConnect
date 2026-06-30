## 2026-06-30 - Removed hardcoded Firebase API Key
**Vulnerability:** Hardcoded API Key in frontend testing scripts.
**Learning:** Seed scripts often hardcode secrets for ease of use, which exposes API keys in public or private repositories.
**Prevention:** Use environment variables (like `process.env`) to load sensitive information, even in local or development scripts.
