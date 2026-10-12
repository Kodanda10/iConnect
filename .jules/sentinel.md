## 2025-12-18 - Hardcoded Firebase API Keys in Test Scripts
**Vulnerability:** Firebase API keys were hardcoded as raw strings (`AIzaSy...`) inside seed scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`), posing a risk if scripts are leaked or scanned.
**Learning:** Even internal testing or utility scripts are vulnerable to committing secrets. Using `process.env` consistently across the entire codebase prevents this.
**Prevention:** Use environment variables like `process.env.NEXT_PUBLIC_FIREBASE_API_KEY` in all backend and testing scripts, rather than raw strings.
