## 2024-08-27 - Hardcoded Firebase Config in Node Utility Scripts
**Vulnerability:** Firebase config including API keys were hardcoded directly in node utility scripts.
**Learning:** While Firebase API keys are public in client apps, hardcoding them in server-side Node utility scripts triggers credential scanners.
**Prevention:** Always use environment variables with dotenv configuration in server-side Node scripts to read configuration.
