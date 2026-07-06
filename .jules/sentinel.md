## 2026-07-06 - Prevent User Enumeration in Authentication
**Vulnerability:** The login page returned specific errors for "User not found" and "Incorrect password", allowing attackers to enumerate valid email addresses.
**Learning:** Authentication endpoints should always return generic error messages for invalid credentials to prevent leaking user existence.
**Prevention:** Use a generic "Invalid email or password" error message for all credential-related authentication failures.
