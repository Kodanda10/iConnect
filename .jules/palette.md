## 2024-12-18 - Input fields without proper label association
**Learning:** Found multiple instances where input elements are visually styled with labels, but lack proper `htmlFor` and `id` attributes. This breaks screen reader association and reduces click target area for users.
**Action:** Always link labels to their corresponding inputs using `htmlFor` and `id` attributes to improve accessibility and usability.
