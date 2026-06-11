## 2026-06-11 - Dynamic Labels on Interactive Elements
**Learning:** When adding aria-label to elements that display dynamic content (like a dropdown), hardcoded labels obscure the current state. Also, custom selection elements built with <button> tags should use aria-pressed instead of aria-selected.
**Action:** Use dynamic aria-label strings that include the current value, and enforce aria-pressed for button selection states.
