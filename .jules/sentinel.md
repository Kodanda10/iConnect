## 2026-06-12 - Prevent hardcoded config secrets
**Vulnerability:** Seed scripts contained hardcoded project API keys and configuration directly in the source code.
**Learning:** Hardcoded configuration variables, even if seemingly harmless like public Firebase keys, can lead to security posture drift and potential misuse.
**Prevention:** Always use environment variables (e.g., dotenv) to inject configuration at runtime and ensure .env files are in .gitignore.
