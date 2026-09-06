## 2024-12-19 - Hardcoded Firebase API Keys in Utility Scripts
**Vulnerability:** Firebase API keys were hardcoded into Node.js utility and seed scripts (e.g., `iconnect-web/src/scripts/*.ts`).
**Learning:** While Firebase client API keys are generally public identifiers intended for inclusion in frontend source code, hardcoding them directly into non-frontend utility scripts triggers automated credential scanners and presents a poor security posture.
**Prevention:** Always use environment variables (`process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) to inject these keys into utility scripts. Make sure to use `dotenv` to load the environment variables when running scripts outside the Next.js context.
