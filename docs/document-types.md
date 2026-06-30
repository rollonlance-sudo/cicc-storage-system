# Document / Paper Types — Feature Documentation

The **General Setup** section lets administrators manage the catalogue of
government-style paper/document types used across the Storage System. Each type
has a full name and a unique abbreviation/code, belongs to a manageable
category, and can be activated, deactivated, archived, restored, or (by a
System Administrator) permanently deleted.

---

## 1. Where it lives

| Concern | Location |
|---|---|
| General Setup page | `/setup/document-types` (sidebar → **General Setup**) |
| Archive (trash) page | `/setup/archive` |
| React pages | `resources/js/pages/setup/{index,archive}.tsx` |
| React dialogs | `resources/js/components/setup/{document-type-dialog,category-dialog}.tsx` |
| Flash banner | `resources/js/components/setup/flash-messages.tsx` |
| Controllers | `app/Http/Controllers/Setup/{DocumentTypeController,DocumentCategoryController,ArchiveController}.php` |
| Form requests (validation) | `app/Http/Requests/Setup/{DocumentTypeRequest,DocumentCategoryRequest}.php` |
| Models | `app/Models/{DocumentType,DocumentCategory}.php` |
| Migrations | `database/migrations/*_create_document_categories_table.php`, `*_create_document_types_table.php` |
| Seeders | `database/seeders/{DocumentTypeSeeder,RolesAndPermissionsSeeder,AdminUserSeeder}.php` |
| Routes | `routes/web.php` (`setup.*` group) |

---

## 2. Data model

### `document_categories`
| column | type | notes |
|---|---|---|
| id | bigint PK | |
| name | string | **unique** (e.g. "Procurement Document") |
| slug | string | unique, auto-generated from `name` |
| description | string, nullable | |
| is_active | boolean | default `true` |
| sort_order | unsigned int | default `0` |
| timestamps, **deleted_at** | | soft deletes |

### `document_types`
| column | type | notes |
|---|---|---|
| id | bigint PK | |
| code | string(50) | **unique** abbreviation (e.g. "NoM") |
| name | string | full name, **required** |
| document_category_id | FK → `document_categories.id` | `restrictOnDelete` — a category in use cannot be hard-deleted |
| description | text, nullable | |
| is_active | boolean | default `true` |
| sort_order | unsigned int | default `0` |
| timestamps, **deleted_at** | | soft deletes |

`DocumentType::category()` → `belongsTo(DocumentCategory)`.
`DocumentCategory::documentTypes()` → `hasMany(DocumentType)`.
The category slug is kept in sync with its name automatically (`DocumentCategory::booted()`).

---

## 3. Roles & permissions

Powered by **spatie/laravel-permission**. Seeded in `RolesAndPermissionsSeeder`.

| Permission | Meaning |
|---|---|
| `setting.manage` | View / create / edit / toggle / archive / restore document types & categories |
| `setting.purge` | **Permanently** delete archived records |

| Role | Permissions |
|---|---|
| **admin** (System Administrator) | everything, incl. `setting.purge` (also bypasses every gate via `Gate::before` in `AppServiceProvider`) |
| **manager** | `setting.manage` only — manages setup + archive/restore, **cannot** permanently delete |
| **staff** | none of the above — no access to General Setup |

Gates are shared to the React frontend in `HandleInertiaRequests::share()` as
`auth.can.manageSetting` and `auth.can.purgeSetting`. The sidebar entry and the
"Delete permanently" buttons are shown/hidden accordingly; the routes are also
protected server-side (`can:setting.manage`, `can:setting.purge`).

---

## 4. Routes

All under the `auth` + `can:setting.manage` middleware, prefix `setup`:

| Method | URI | Name | Action |
|---|---|---|---|
| GET | `/setup` | `setup.index` | redirect → document types |
| GET | `/setup/document-types` | `setup.document-types.index` | General Setup page |
| POST | `/setup/document-types` | `setup.document-types.store` | create |
| PATCH | `/setup/document-types/{documentType}` | `setup.document-types.update` | update / toggle active |
| DELETE | `/setup/document-types/{documentType}` | `setup.document-types.destroy` | archive (soft delete) |
| POST | `/setup/document-types/{id}/restore` | `setup.document-types.restore` | restore |
| DELETE | `/setup/document-types/{id}/force` | `setup.document-types.force` | **purge** (`can:setting.purge`) |
| POST | `/setup/categories` | `setup.categories.store` | create |
| PATCH | `/setup/categories/{documentCategory}` | `setup.categories.update` | update / toggle active |
| DELETE | `/setup/categories/{documentCategory}` | `setup.categories.destroy` | archive (blocked if in use) |
| POST | `/setup/categories/{id}/restore` | `setup.categories.restore` | restore |
| DELETE | `/setup/categories/{id}/force` | `setup.categories.force` | **purge** (`can:setting.purge`) |
| GET | `/setup/archive` | `setup.archive.index` | Archive page |

---

## 5. Validation rules

`DocumentTypeRequest`:
- `code` — required, ≤ 50 chars, **unique** among non-archived types (ignores the current row on edit)
- `name` — required, ≤ 255 chars
- `document_category_id` — required, must exist among non-archived categories
- `description` — optional, ≤ 2000 chars
- `is_active` — boolean
- `sort_order` — integer ≥ 0

`DocumentCategoryRequest`:
- `name` — required, ≤ 255 chars, **unique** among non-archived categories
- `description` — optional, ≤ 2000 chars
- `is_active` — boolean
- `sort_order` — integer ≥ 0

Both requests `authorize()` against `setting.manage`.

---

## 6. Delete / archive behaviour (soft deletes)

1. **Deactivate** — toggle `is_active` off to retire a type without removing it.
2. **Archive** — soft-deletes the record; it disappears from the main list and
   appears on the Archive page. A category cannot be archived while active
   document types still reference it (friendly error).
3. **Restore** — any `setting.manage` user can restore from the Archive page.
4. **Permanently delete (purge)** — only the System Administrator
   (`setting.purge`). A category cannot be purged while any type (including
   archived ones) still references it (FK `restrictOnDelete` + a guard).

---

## 7. Seeding & extending

`DocumentTypeSeeder` holds the 28 standard types as
`[code, name, category, description]`. It derives the distinct categories in
first-appearance order, creates them, then `updateOrCreate`s each type keyed on
`code` (idempotent — re-running refreshes names/descriptions without
duplicating). This yields **28 document types across 18 categories**.

**Add more types/categories manually** via the General Setup UI, or extend the
array in `DocumentTypeSeeder::documentTypes()` and re-run
`php artisan db:seed --class=DocumentTypeSeeder`.

See also: [Admin guide](document-types-guide.md) · [Checklist](document-types-checklist.md)
