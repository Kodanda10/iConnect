## 2024-12-14 - Removed hardcoded Firebase API keys
**Vulnerability:** Firebase API keys were hardcoded in multiple seed scripts (e.g. seed-tasks.ts, seed-constituents.ts).
**Learning:** Hardcoding credentials into Node.js utility or seed scripts triggers automated credential scanners, which is a significant security vulnerability even for public identifiers.
**Prevention:** Always substitute hardcoded keys with environment variables (e.g., process.env.NEXT_PUBLIC_FIREBASE_API_KEY) using dotenv in scripts executing outside the context of a framework like Next.js.
