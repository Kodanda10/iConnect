## 2024-09-23 - Hardcoded API Key
**Vulnerability:** Hardcoded API key found in Flutter firebase_options.dart configuration.
**Learning:** Hardcoding credentials in source code exposes them to anyone with repository access or through decompilation.
**Prevention:** Use String.fromEnvironment() to inject API keys via environment variables at build time, ensuring secrets remain out of source control.
