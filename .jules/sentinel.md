## 2025-05-15 - Hardcoded API Keys in Seed Scripts
**Vulnerability:** Firebase config with hardcoded `apiKey` and other secrets was found in seed scripts.
**Learning:** Seed scripts are often overlooked during security reviews because they are run locally, but committing hardcoded API keys to source control exposes the project.
**Prevention:** Use `dotenv` and environment variables to configure Firebase even in local utility scripts.
