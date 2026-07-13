## 2025-12-18 - Prevent Privilege Escalation in Firestore Rules
**Vulnerability:** Leaders were able to update user roles and delete users in `firebase/firestore.rules`.
**Learning:** `isLeader()` was incorrectly given `update` and `delete` access to the `/users/{userId}` collection, allowing leaders to modify other users' roles (including granting themselves or others `STAFF` privileges) and delete accounts.
**Prevention:** Always restrict sensitive user management operations (like updating roles and deleting accounts) to the highest privilege level (`STAFF` in this case), and strictly enforce role checks.
