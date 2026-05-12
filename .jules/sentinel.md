## 2025-01-15 - Hardcoded API Keys in Seed Scripts
**Vulnerability:** Hardcoded Firebase API keys and config values were found in multiple database seeding scripts.
**Learning:** Developer convenience tools (like seed scripts) are often overlooked during security reviews, leading to checked-in secrets.
**Prevention:** Use dotenv to resolve environment variables relative to the workspace root for all utility scripts, and enforce pre-commit secret scanning.
