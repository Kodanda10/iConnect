## 2025-02-18 - [Account Enumeration in Login]
**Vulnerability:** The login page explicitly distinguished between "User not found" and "Incorrect password" error messages.
**Learning:** Developers often provide specific error messages to help users, but this leaks which email addresses are registered in the system (account enumeration), facilitating targeted attacks.
**Prevention:** Always return a generic "Invalid email or password" message for any authentication failure, regardless of the underlying reason (user missing, wrong password, etc.).
