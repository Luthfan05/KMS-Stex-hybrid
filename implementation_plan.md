# Implementation Plan for UI Enhancements

## Goal Description
Apply the user‑approved changes:
1. Add placeholder FAQ and Dictionary pages.
2. Implement copy‑protection on document pages (CSS + JS).
3. Extend the admin dashboard table with **Last Login** and **Status** columns.
4. Keep the admin button emoji (⚙️) in the navbar only; remove all other emojis from the UI.
5. No additional styling preferences.

## Proposed Changes
---
### Navbar & Pages
- **[MODIFY] docusaurus.config.ts** – keep the admin button emoji, ensure other navbar items have no emojis.
- **[NEW] src/pages/faq.tsx** – simple page with placeholder text.
- **[NEW] src/pages/dictionary.tsx** – simple page with placeholder text.

### Copy Protection
- **[MODIFY] src/css/custom.css** – add `.no-copy { user-select: none; -webkit-user-select: none; }`.
- **[MODIFY] src/pages/document.tsx** – wrap the rendered content in a `<div className="no-copy">` and add a `useEffect` that registers a `copy` event listener to prevent copying.

### Admin Dashboard
- **[MODIFY] src/pages/admin.tsx** –
  - Update `fetchUsers` to select `last_login` and `status`.
  - Extend table header to include `Last Login` and `Status` columns.
  - Render these fields in each row.
  - Remove the leading ⚙️ emoji from the dashboard title (keep text only).
  - Simplify activity‑log icons: replace emoji icons with plain text labels or remove them.

### Emoji Cleanup
- **[MODIFY] src/pages/admin.tsx** – remove emojis from headings and activity log icons (except navbar admin button).
- **[MODIFY] src/pages/index.tsx** – replace department card icons with plain text or remove them.
- **[MODIFY] src/pages/documents/edit.tsx** & **src/pages/documents/new.tsx** – remove emoji prefixes from department labels.
- **[MODIFY] src/pages/documents.tsx** – remove emoji from the Operasional entry.

## Open Questions
- None (all decisions confirmed).

## Verification Plan
### Automated Tests
- Run `npm run dev` and manually verify:
  * Navbar shows admin button with ⚙️, other items have no emojis.
  * FAQ and Dictionary pages display placeholder text.
  * Document view pages cannot be selected/copied (CSS) and `copy` events are blocked (JS).
  * Admin dashboard table includes Last Login and Status columns with correct data.
  * No stray emojis appear in UI.

### Manual Verification
- Open the site in a browser, switch languages, navigate to new pages, attempt to copy text, and inspect the admin table.

---
