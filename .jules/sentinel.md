## 2024-10-02 - Hardcoded Firebase API Keys
**Vulnerability:** The Firebase API key was hardcoded in lib/firebase_options.dart and several seeding scripts in iconnect-web/src/scripts.
**Learning:** Hardcoding secrets like API keys directly in source code allows anyone with read access to the repository to obtain them, posing a significant security risk, especially in public repositories or compromised environments.
**Prevention:** Always use environment variables to inject sensitive configuration values at build time (e.g., String.fromEnvironment in Dart or process.env in Node.js/Next.js) and ensure .env files are included in .gitignore.
