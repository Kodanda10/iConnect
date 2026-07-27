## 2025-12-18 - Client-Side API Key Exposure
**Vulnerability:** Found `process.env.API_KEY` being read directly in the client-side `services/gemini.ts` code, along with direct usage of `@google/genai`.
**Learning:** Client-side environment variables or processes that are bundled into the web app expose secrets to end users.
**Prevention:** Always proxy AI calls or sensitive API requests through a secure backend (like Firebase Cloud Functions) where API keys can be managed via Secret Manager or server-side environment variables.
