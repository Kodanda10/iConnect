## 2025-01-20 - Add ARIA Labels to Dashboard & Calendar Icons
**Learning:** Found several core UI components (like the navigation header and custom calendar) relying on icon-only buttons (`lucide-react`) without accessible names, negatively impacting screen reader navigation.
**Action:** Always ensure icon-only interactive elements contain `aria-label` or `title` attributes that explicitly describe their action, regardless of contextual placement.
