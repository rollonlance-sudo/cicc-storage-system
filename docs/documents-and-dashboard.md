# Documents & Papers — Feature Documentation

Builds on the [Document Types](document-types.md) catalogue: actual **document
(paper) records** are stored, searchable and browsable per type, and populated by
a **mock data seeder**.

> The app is search/storage-first: **Documents** (`/papers`) is the home page
> (login and `/` redirect here). There is no dashboard. Action feedback is shown
> via a global **toaster** (top-right pop-ups), not inline banners.

---

## 1. Where it lives

| Concern | Location |
|---|---|
| Documents hub / home (search + browse by type) | `/papers` → `Papers\PaperController@index` → `resources/js/pages/papers/index.tsx` |
| Per-type page | `/papers/{code}` → `Papers\PaperController@show` → `resources/js/pages/papers/show.tsx` |
| Document create/edit dialog | `resources/js/components/papers/document-dialog.tsx` |
| Write controller | `app/Http/Controllers/Papers/DocumentController.php` |
| Validation | `app/Http/Requests/DocumentRequest.php` |
| Model / factory | `app/Models/Document.php`, `database/factories/DocumentFactory.php` |
| Migration | `database/migrations/*_create_documents_table.php` |
| Mock seeder | `database/seeders/MockDocumentSeeder.php` |

---

## 2. `documents` table

| column | type | notes |
|---|---|---|
| id | bigint PK | |
| document_type_id | FK → `document_types.id` | `cascadeOnDelete` |
| reference_no | string | **unique** (e.g. `NoM-2026-0001`) |
| title | string | required |
| description | text, nullable | |
| status | string | one of `draft, pending, approved, released, completed, cancelled` (`Document::STATUSES`) |
| document_date | date, nullable | |
| amount | decimal(15,2), nullable | for financial/procurement papers |
| prepared_by | string, nullable | |
| timestamps, **deleted_at** | | soft deletes |

`Document::type()` → belongsTo `DocumentType`; `DocumentType::documents()` → hasMany.

---

## 3. Roles & permissions

Adds one permission to the [existing catalogue](document-types.md#3-roles--permissions):

| Permission | Meaning | Roles |
|---|---|---|
| `document.manage` | create / edit / archive / restore document records | admin, manager, **staff** |

Reading (`/papers`, `/papers/{code}`) requires only authentication.
Writing requires `document.manage`. Shared to the frontend as
`auth.can.manageDocument` (controls the Add/Edit/Archive UI).

---

## 4. Routes

| Method | URI | Name | Notes |
|---|---|---|---|
| GET | `/papers` | `papers.index` | auth — **app home** (`/` and post-login redirect here) |
| GET | `/papers/{documentType:code}` | `papers.show` | auth; bound by **code** |
| POST | `/papers/{documentType:code}/documents` | `documents.store` | `can:document.manage` |
| PATCH | `/documents/{document}` | `documents.update` | `can:document.manage` |
| DELETE | `/documents/{document}` | `documents.destroy` | archive (soft delete) |
| POST | `/documents/{id}/restore` | `documents.restore` | restore |

> Note: `papers.show` binds `DocumentType` by `code` (`{documentType:code}`); the
> General Setup routes still bind by `id`.

---

## 5. Toast notifications

Action feedback (create / update / archive / restore) is delivered via the
session flash (`flash.success` / `flash.error`, shared in `HandleInertiaRequests`)
and rendered by a global **Toaster** (`resources/js/components/ui/toast.tsx`),
mounted once in `resources/js/layouts/app-layout.tsx`. It listens to Inertia's
`router.on('success')` (plus the initial page load), shows a top-right pop-up that
auto-dismisses after 5s, and can be closed manually. There are no inline flash
banners.

---

## 6. Per-type pages ("a page for every kind of paper")

`/papers` lists every document type as a card, grouped by category, each linking
to `/papers/{code}`. That page shows the type's header (code, name, category,
description) and a searchable, status-filterable table of its records. Users with
`document.manage` get **Add document**, plus per-row **Edit** and **Archive**.

### Search (locates inside every type)

The search box on `/papers` does two things at once:
- **instant client filter** of the type cards (by code / name / category), and
- a **debounced server search** (`?q=`) that looks *inside* the types —
  `PaperController@index` matches documents on `reference_no`, `title`,
  `prepared_by`, and `description` (LIKE), returning up to 50 hits plus a total
  count via a partial Inertia reload (`only: documents, documentMatches, filters`).

Matching documents appear in a **"Matching documents"** table above the type
cards; clicking a row opens that document's type page with the query passed
through (`/papers/{code}?q=…`), which pre-fills the page's search so the record is
already surfaced.

---

## 7. Mock data seeder

`MockDocumentSeeder` creates 6–28 records per type (~450–500 total) with:
- reference numbers `{CODE}-{YYYY}-{NNNN}`,
- a weighted status mix (more completed/approved than draft/cancelled),
- dates spread over the last ~12 months,
- amounts only on financial categories (Procurement / Accounting / Payment / Financial / Budget).

It is idempotent (skips if any documents exist) and runs as part of
`php artisan migrate:fresh --seed`. To reseed just the documents:
`php artisan db:seed --class=MockDocumentSeeder` (after clearing the table).

See also: [Document Types](document-types.md) · [Admin guide](document-types-guide.md)
