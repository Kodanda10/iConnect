## 2026-06-15 - Remove Hardcoded Firebase API Keys
**Vulnerability:** Hardcoded Firebase API keys were found in multiple seed scripts.
**Learning:** Seed scripts should not have hardcoded secrets as they can be committed to version control and exposed. They should use process.env variables populated from a .env file.
**Prevention:** Use dotenv and environment variables for all secrets, even in test or seed scripts.
