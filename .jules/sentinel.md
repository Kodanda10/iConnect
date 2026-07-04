## 2026-07-04 - Prevent Account Enumeration
**Vulnerability:** Verbose authentication error messages exposed whether a user account existed in the system.
**Learning:** Returning specific errors like 'user-not-found' or 'wrong-password' allows attackers to enumerate valid usernames.
**Prevention:** Always return generic error messages such as 'Invalid email or password' for all authentication failures.
