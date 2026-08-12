## 2025-01-30 - Prevent hardcoded API keys in utility scripts
**Vulnerability:** Hardcoded Firebase API keys were found directly embedded in utility scripts (`seed-constituents.ts`, `seed-december.ts`, `seed-tasks.ts`).
**Learning:** Although Firebase client keys are often considered public identifiers, hardcoding them directly into Node.js utility or seed scripts triggers automated credential scanners and violates security policies.
**Prevention:** Always use environment variables (e.g., `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) configured via `dotenv` in utility and seed scripts to prevent exposing credentials in source code.
