## 2025-12-18 - Settings Authorization Bypass
**Vulnerability:** Found an authorization bypass in `firebase/firestore.rules` where `allow write: if isStaffOrLeader();` allowed any leader to modify global application settings, contradicting the intended security design. Additionally, `active_tickers` allowed horizontal privilege escalation.
**Learning:** Temporary permissions (`Grant full access to both for now`) often become permanent security holes if not actively tracked and removed.
**Prevention:** Strictly enforce the principle of least privilege. Global configuration should only be mutable by administrators (STAFF), not operational users (LEADERS).
