## 2024-08-28 - Hardcoded Firebase API Keys in Seed Scripts
**Vulnerability:** Hardcoded Firebase API key ('AIzaSy...') found in multiple Node utility scripts (seed scripts).
**Learning:** Hardcoding credentials into script files triggers automated credential scanners, exposing the API keys.
**Prevention:** Always replace hardcoded credentials with environment variables, such as process.env.NEXT_PUBLIC_FIREBASE_API_KEY, configuring dotenv when running utility scripts outside the Next.js context.
