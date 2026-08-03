## 2025-02-28 - Hardcoded Firebase API Keys
**Vulnerability:** Found hardcoded Firebase API keys in Dart code and TypeScript seed scripts.
**Learning:** Hardcoding credentials exposes them in source control and client builds. Dart code can retrieve them at compile time via `String.fromEnvironment`, and Node scripts can use `dotenv` to load them from `.env` files.
**Prevention:** Always use environment variables for sensitive keys and ensure they are not committed to source control.
