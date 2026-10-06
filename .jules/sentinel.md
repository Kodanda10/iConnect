## 2024-10-06 - Hardcoded API Keys in Seed Scripts and Configs
**Vulnerability:** Hardcoded Firebase API keys found in multiple TypeScript seed scripts and Flutter Dart configurations.
**Learning:** Storing secrets in source code, even for testing scripts, creates a severe risk of exposure if the repository is made public or compromised.
**Prevention:** Always use environment variables (`process.env` via `dotenv` in Node, `String.fromEnvironment` in Dart) to securely inject configuration at runtime or build time.
