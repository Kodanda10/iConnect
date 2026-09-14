1. **Add ARIA labels to icon-only buttons in `GlassCalendar.tsx`**:
   - In `iconnect-web/src/components/ui/GlassCalendar.tsx`, the "Previous Month" and "Next Month" buttons are icon-only buttons (`<ChevronLeft />` and `<ChevronRight />`) but lack `aria-label` attributes, making them inaccessible to screen readers.
   - I will add `aria-label="Previous month"` and `aria-label="Next month"` to these buttons respectively.
2. **Add aria-label to calendar day buttons in `GlassCalendar.tsx`**:
   - The individual day buttons in the calendar grid currently just contain the day number. For better accessibility, I will add an `aria-label` that includes the full date (e.g., `aria-label={date.toDateString()}`). This provides more context for screen reader users.
3. **Verify the changes**:
   - I'll run `git diff --cached iconnect-web/src/components/ui/GlassCalendar.tsx` to ensure the modifications were successful and accurate.
4. **Run linters and tests**:
   - Since these are small changes, I'll run `cd /app/iconnect-web && pnpm lint` and `pnpm test` to verify the frontend app hasn't broken.
5. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done**:
   - I will run `pre_commit_instructions` tool and complete all required pre-commit checks.
6. **Submit PR**:
   - Once everything passes, I will commit and push the changes as `🎨 Palette: [UX improvement] Add ARIA labels to GlassCalendar`.
