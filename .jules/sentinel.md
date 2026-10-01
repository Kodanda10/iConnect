## 2024-10-01 - Remove hardcoded API key from config
**Vulnerability:** Hardcoded API keys in `lib/firebase_options.dart` and `iconnect-web` dist files (though web dists shouldn't be edited directly).
**Learning:** Hardcoding API keys exposes secrets in version control.
**Prevention:** Use environment variables for sensitive configuration data.
