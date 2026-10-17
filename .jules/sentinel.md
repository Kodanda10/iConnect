## 2025-12-17 - Removed hardcoded Firebase API keys
**Vulnerability:** Found hardcoded Firebase API keys in multiple Next.js seed scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** Hardcoding credentials, even in testing or seed scripts, poses a significant risk of exposure if the repository becomes public or is inadvertently shared.
**Prevention:** Use environment variables (e.g., `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) and load them securely via tools like `dotenv`.
