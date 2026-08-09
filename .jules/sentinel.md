## 2025-02-27 - Hardcoded API Key
**Vulnerability:** Hardcoded Firebase API keys in multiple node script files.
**Learning:** Hardcoding credentials makes them easy to leak.
**Prevention:** Always read credentials from environment variables such as `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`.
