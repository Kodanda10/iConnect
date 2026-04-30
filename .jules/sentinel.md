## 2026-04-30 - [Hardcoded Firebase API Keys in Seed Scripts]
**Vulnerability:** Found hardcoded Firebase API Key ('AIzaSy...') in multiple development seed scripts.
**Learning:** Developers often hardcode secrets in utility/seed scripts for convenience, bypassing standard config management.
**Prevention:** Ensure all scripts, not just application code, load configuration dynamically from environment variables (e.g., using dotenv).
