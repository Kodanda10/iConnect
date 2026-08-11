## 2025-12-18 - Hardcoded Firebase Credentials in Seed Scripts
**Vulnerability:** Firebase client configuration objects (including apiKey, authDomain, projectId) were hardcoded in multiple seed scripts (`seed-tasks.ts`, `seed-constituents.ts`, `seed-december.ts`).
**Learning:** While Firebase client keys are often public identifiers, hardcoding them directly into utility/seed scripts triggers automated credential scanners and violates best practices for managing secrets. Using environment variables is safer.
**Prevention:** Always load credentials using `dotenv` or similar environment configuration tools in seed and utility scripts, referencing variables like `process.env.NEXT_PUBLIC_FIREBASE_API_KEY` rather than raw strings.
