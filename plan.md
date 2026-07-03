1. **Fix hardcoded API keys in seed scripts:**
   - The files `iconnect-web/src/scripts/seed-constituents.ts`, `iconnect-web/src/scripts/seed-december.ts`, and `iconnect-web/src/scripts/seed-tasks.ts` contain a hardcoded Firebase API key (`AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8`).
   - I will modify these files to use `process.env.VITE_FIREBASE_API_KEY` or `process.env.NEXT_PUBLIC_FIREBASE_API_KEY` (or similar environment variable used in this project) or load from `.env` instead.
   - I will verify the fix by checking the diff.

2. **Check the project environment variables**
   - I will check `iconnect-web/src/lib/firebase.ts` to see what environment variable is used for the Firebase API key in this project.

3. **Log learning in `.jules/sentinel.md`:**
   - I will add a journal entry to `.jules/sentinel.md` about the hardcoded API keys found in seed scripts, following the required format.

4. **Complete pre-commit steps:**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

5. **Submit the changes via PR:**
   - I will commit the changes to a new branch and use `gh pr create` with the "🛡️ Sentinel: [CRITICAL] Fix hardcoded API keys" title and appropriate description.
