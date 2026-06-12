1.  **Remove hardcoded API keys from seed scripts**
    - Modify `iconnect-web/src/scripts/seed-tasks.ts`, `iconnect-web/src/scripts/seed-constituents.ts`, and `iconnect-web/src/scripts/seed-december.ts`.
    - Replace the hardcoded `apiKey: 'AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8'` with environment variable references (e.g., `apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY`). Ensure dotenv is imported and configured.
2.  **Verify modifications**
    - Use `git diff` to confirm the changes.
3.  **Journal Entry**
    - Add a critical learning about hardcoded secrets to `.jules/sentinel.md`.
4.  **Complete pre-commit steps**
    - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
5.  **Submit the pull request**
    - Use bash commands to push the branch and create a PR with the required format: `🛡️ Sentinel: [CRITICAL] Fix hardcoded API keys`.
