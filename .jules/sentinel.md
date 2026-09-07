## 2024-05-18 - Hardcoded Firebase API keys in seed scripts
**Vulnerability:** Found hardcoded Firebase API keys in `src/scripts/seed-tasks.ts`, `src/scripts/seed-constituents.ts`, and `src/scripts/seed-december.ts`.
**Learning:** Even if Firebase client keys are public identifiers in client apps, hardcoding them into node scripts triggers credential scanners and constitutes bad practice.
**Prevention:** Always rely on environment variables (`process.env`) instead of hardcoding any form of API key or secret directly into Node utility scripts.
