## 2024-12-16 - Hardcoded API Keys in Node Scripts
**Vulnerability:** Firebase API keys hardcoded directly into Node.js utility and seed scripts (`src/scripts/*.ts`), which triggers automated credential scanners.
**Learning:** Although Firebase client keys are public identifiers in client apps, hardcoding them in standalone server/Node scripts exposes them unnecessarily and violates security scanner policies.
**Prevention:** Always use `dotenv` to load Firebase configuration from environment variables (e.g., `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) when writing Node.js scripts outside of the Next.js context.
