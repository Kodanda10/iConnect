## 2026-05-10 - Remove client-side API key exposure
**Vulnerability:** Client-side code in services/gemini.ts accessed process.env.API_KEY, risking exposure of the Gemini API key to end users.
**Learning:** The PRD mandated all API calls must go through Cloud Functions, but legacy web client code still tried to construct an AI client directly.
**Prevention:** Ensure frontend components never directly instantiate API clients for sensitive services. All API keys must remain strictly within backend environments (e.g., Cloud Functions).
