## 2025-12-18 - Client-Side API Key Exposure
**Vulnerability:** Found `process.env.API_KEY` being read directly in the client-side `services/gemini.ts` code, along with direct usage of `@google/genai`.
**Learning:** Client-side environment variables or processes that are bundled into the web app expose secrets to end users.
**Prevention:** Always proxy AI calls or sensitive API requests through a secure backend (like Firebase Cloud Functions) where API keys can be managed via Secret Manager or server-side environment variables.
## 2025-12-18 - Active Tickers Authorization Bypass
**Vulnerability:** Found an authorization bypass in `firebase/firestore.rules` where `allow write: if isStaffOrLeader();` allowed any leader to overwrite or delete another leader's active meeting ticker because the rule lacked a check matching `request.auth.uid` against the `docId` (which represents the leader's UID).
**Learning:** Broad role-based rules (`isStaffOrLeader()`) applied to collections keyed by user ID can lead to horizontal privilege escalation if ownership checks are omitted.
**Prevention:** Always combine role-based access control (RBAC) with ownership validation (e.g., `request.auth.uid == docId`) when documents are strictly owned by specific users.
