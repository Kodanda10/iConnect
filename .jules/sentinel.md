## 2024-05-24 - Hardcoded Firebase Config Secret Exposure
**Vulnerability:** Hardcoded API keys (specifically Firebase configurations including apiKey) found in seed scripts.
**Learning:** Hardcoding API keys in scripts makes them difficult to rotate and increases the risk of accidental exposure.
**Prevention:** Use environment variables (e.g., process.env.NEXT_PUBLIC_FIREBASE_API_KEY) in Node/Next.js and script contexts.
