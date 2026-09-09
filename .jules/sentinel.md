## 2024-10-25 - Hardcoded Firebase API Keys in Node Utility Scripts
**Vulnerability:** Hardcoded Firebase API keys were found in Node.js utility and seed scripts (e.g., src/scripts/*.ts).
**Learning:** While Firebase client API keys are public in client apps, hardcoding them directly into Node utility scripts triggers automated credential scanners.
**Prevention:** Always replace hardcoded Firebase API keys in Node utility scripts with environment variables (e.g., process.env.NEXT_PUBLIC_FIREBASE_API_KEY) and use dotenv to load them outside the Next.js context.
