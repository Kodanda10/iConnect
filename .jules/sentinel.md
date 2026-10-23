## 2024-12-12 - Hardcoded API Keys in Seed Scripts
**Vulnerability:** Firebase API Keys were hardcoded in multiple seed scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** This occurred due to the friction of setting up environment variables for standalone scripts, leading to quick-and-dirty hardcoding which risks exposing secrets if scripts are published or accessed.
**Prevention:** Always use `dotenv` to load configurations from environment files (e.g., `.env.local`), even in internal developer scripts, to ensure secrets are never committed to version control.
