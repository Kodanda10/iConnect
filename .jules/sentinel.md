## 2024-08-20 - Hardcoded API Keys in Multiple Environments
**Vulnerability:** Hardcoded Firebase API keys in both Next.js seed scripts (Node.js environment) and Flutter's default firebase_options.dart configuration.
**Learning:** Seed scripts often run outside of standard build toolchains (like Next.js) and require explicit environment variable loading (dotenv). Flutter generated configs tend to hardcode keys which can be exposed if committed to public repositories or shared improperly.
**Prevention:** Use build-time environment variable injection (String.fromEnvironment in Flutter, and dotenv for node scripts) and ensure configuration generation tools output secrets appropriately or .gitignore them.
