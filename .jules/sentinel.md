## 2024-09-08 - Hardcoded Firebase API Keys in Utility Scripts
**Vulnerability:** Found hardcoded Firebase API keys in Node.js seed scripts (e.g. `seed-tasks.ts`, `seed-constituents.ts`). Although Firebase keys are public identifiers for client apps, hardcoding them directly in utility scripts exposes them unnecessarily and triggers automated credential scanners.
**Learning:** These utility scripts execute outside the Next.js context and do not automatically load environment variables, which likely led to the keys being hardcoded for convenience.
**Prevention:** Always use environment variables (e.g. `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) even in utility scripts. Explicitly import and configure `dotenv` to load them correctly.
