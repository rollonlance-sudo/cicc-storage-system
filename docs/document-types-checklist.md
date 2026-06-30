# Checklist — Document / Paper Types Feature

Use this to set up, verify, and QA the General Setup → Document Types feature.

## Setup / build

- [ ] `composer install` and `npm install` completed
- [ ] `spatie/laravel-permission` installed and config/migration published
- [ ] `.env` configured (MySQL `storage_system`, or SQLite fallback), `APP_NAME="CICC Storage System"`
- [ ] `php artisan migrate:fresh --seed` runs without errors
- [ ] `npm run build` (or `npm run dev`) succeeds

## Data seeded

- [ ] `document_types` count = **28**
- [ ] `document_categories` count = **18**
- [ ] 3 users seeded: `admin@`, `manager@`, `staff@storagesystem.test`
- [ ] Roles `admin`, `manager`, `staff` exist
- [ ] Permissions `setting.manage`, `setting.purge` exist
- [ ] admin has `setting.purge`; manager has `setting.manage` but **not** `setting.purge`

## Requirements coverage

- [ ] Each type has: full name, abbreviation/code, category, description, active status, sort order
- [ ] Abbreviation/code is **unique** (duplicate is rejected)
- [ ] Full name is **required** (blank is rejected)
- [ ] Category is selectable from a managed list
- [ ] Categories are themselves manageable in the General Setup page (Categories tab)
- [ ] Admins can add more document types manually
- [ ] All 28 standard government types seeded with verbatim descriptions

## Functional QA (log in as System Administrator)

- [ ] Sidebar shows **General Setup**
- [ ] Document Types tab lists 28 rows; search filters by code/name/category
- [ ] Add a new type (e.g. `XYZ`) → appears in the list with a success message
- [ ] Adding a type with an existing code → validation error on the code field
- [ ] Adding a type with a blank name → validation error on the name field
- [ ] Toggle a type's Active switch → persists
- [ ] Edit a type → changes persist
- [ ] Categories tab: add a category, then select it on a new document type
- [ ] Archiving a category that is in use → blocked with a friendly message
- [ ] Archive a type → leaves the main list, appears on the Archive page
- [ ] Restore from Archive → returns to the main list
- [ ] **Delete permanently** is visible and works for the System Administrator

## Permission gating

- [ ] Log in as **manager** → can manage/archive/restore; **Delete permanently** is hidden
- [ ] `manager` hitting the force-delete route directly → 403
- [ ] Log in as **staff** → no **General Setup** in sidebar; `/setup/document-types` → 403
- [ ] Logged out → `/setup/document-types` redirects to `/login`

## Accounts

- [ ] Public registration removed: `/register` returns 404
- [ ] Login still works; password reset still works

## Documents & Papers

- [ ] `MockDocumentSeeder` populates ~450–500 documents (`Document::count()`)
- [ ] `/papers` is the app home — `/` and post-login redirect here; `/dashboard` returns 404
- [ ] The `/papers` search finds documents inside every type (reference, title, preparer, description)
- [ ] Action feedback shows as top-right **toast** pop-ups (no inline banners)
- [ ] Documents hub `/papers` lists every type grouped by category with counts
- [ ] Each type has its own page `/papers/{code}` with a searchable, status-filterable table
- [ ] `document.manage` users (admin/manager/staff) can add/edit/archive documents; reading needs only auth
- [ ] A user without `document.manage` can browse but gets 403 on write
- [ ] Reference numbers are unique; title + reference required
- [ ] Documents can be archived and restored

## Automated tests

- [ ] `php artisan test --filter=DocumentType` passes
- [ ] `php artisan test --filter=DocumentTest` (Papers) passes
