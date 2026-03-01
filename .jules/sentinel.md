## 2024-05-24 - [CRITICAL] Hardcoded Firebase config with API keys in scripts
**Vulnerability:** Found hardcoded Firebase configurations including `apiKey`, `projectId`, and `appId` in multiple seed scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** These scripts were likely created quickly for local testing but pose a critical risk if committed. They bypass the standard `.env` configuration pattern used elsewhere in the application.
**Prevention:** Always use `dotenv` to load environment variables in standalone Node scripts. Never commit hardcoded secrets, even in test or seed scripts.
