## 2025-02-18 - Prevent Hardcoded API Keys in Seed Scripts
**Vulnerability:** Several utility seed scripts in `iconnect-web/src/scripts/` (`seed-tasks.ts`, `seed-december.ts`, `seed-constituents.ts`) contained hardcoded Firebase configurations with plain-text `apiKey` values. This risks accidental leakage of sensitive credentials when scripts are pushed to public repositories.
**Learning:** Utility and development scripts are often overlooked during security reviews because they aren't part of the core application logic, leading to hardcoded secrets.
**Prevention:** Always enforce the use of `.env` files and `process.env` (via libraries like `dotenv`) for all utility scripts, even locally executed ones.
