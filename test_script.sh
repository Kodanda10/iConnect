echo "Testing hardcoded API key presence in seed scripts..."
grep -ri "AIzaSy" iconnect-web/src/scripts/ || true
