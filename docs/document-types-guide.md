# Admin Guide — General Setup (Document / Paper Types)

A short, task-oriented guide for administrators using the **General Setup**
section to manage document/paper types and their categories.

---

## Logging in

Public sign-up is disabled — this is an internal system. Use a seeded account
(default password **`password`**):

| Role | Email | Can do |
|---|---|---|
| System Administrator | `admin@storagesystem.test` | Everything, including **permanently delete** archived records |
| Records Manager | `manager@storagesystem.test` | Manage types & categories, archive & restore — **not** permanent delete |
| Staff | `staff@storagesystem.test` | No access to General Setup |

> Change these passwords after first login (top-right menu → **Settings → Password**).

---

## Opening General Setup

After logging in as an admin or manager, click **General Setup** in the left
sidebar. The page has two tabs: **Document Types** and **Categories**.

---

## Document Types

- **Search** — type in the search box to filter by code, full name, or category.
- **Add** — click **Add document type**, fill in:
  - **Code / Abbreviation** — short identifier, must be unique (e.g. `NoM`).
  - **Full name** — required (e.g. `Notice of Meeting`).
  - **Category** — pick from the managed list (manage them in the Categories tab).
  - **Description** — optional explanation of what the document is for.
  - **Sort order** — controls the listing order (lower first).
  - **Active** — toggle off to retire it without deleting.
- **Edit** — row menu (⋯) → **Edit**.
- **Active toggle** — flip the switch in the Active column to enable/disable instantly.
- **Archive** — row menu (⋯) → **Archive**. Confirms, then moves it to the Archive page.

---

## Categories

The category list is fully manageable here, and feeds the **Category** dropdown
when creating/editing a document type.

- **Add / Edit** — same pattern as document types (name, description, sort order, active).
- **Types** column — shows how many document types use the category.
- **Archive** — a category that is still used by active document types **cannot**
  be archived; reassign or archive those types first. You'll see a clear message.

---

## Archive page

Click **Archive** (top-right of General Setup) to see everything that's been
archived.

- **Restore** — available to admins and managers; brings the record back to the
  main lists.
- **Delete permanently** — only the **System Administrator** sees this button.
  It removes the record from the database for good (with a confirmation). A
  category cannot be permanently deleted while any document type — even an
  archived one — still references it.

---

## Tips

- Prefer **Deactivate** or **Archive** over permanent deletion — archived
  records stay recoverable.
- Codes are unique. If you get a "code already taken" error, an existing
  (non-archived) type already uses it.
- Need a new category mid-flow? Switch to the **Categories** tab, add it, then
  return to the document type form — it'll be in the dropdown.
