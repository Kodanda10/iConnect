## 2024-12-17 - Missing Programmatic Labels Pattern
**Learning:** High-impact accessibility gap identified: Form inputs (Login) and interactive elements (Scheduler) consistently lack programmatic labels (`htmlFor`/`id`, `aria-label`), relying solely on visual cues. This breaks screen reader navigation.
**Action:** systematically audit all `input` fields for label association and all icon-only `button` elements for `aria-label` during feature work.
