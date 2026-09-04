## 2025-01-09 - Remove hardcoded Firebase credentials from seed scripts
**Vulnerability:** Hardcoded Firebase API keys and project configuration were discovered in Node utility/seed scripts (`iconnect-web/src/scripts/*.ts`).
**Learning:** While Firebase client keys are generally public for client apps, embedding them directly into backend utility scripts can trigger automated credential scanners and presents an unnecessary risk.
**Prevention:** Always use environment variables (e.g., `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`) with `dotenv` configuration for any credentials in Node.js utility or seed scripts, even if they correspond to public client identifiers.
