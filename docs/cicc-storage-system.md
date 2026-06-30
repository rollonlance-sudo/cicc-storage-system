# CICC Storage System — System Documentation

A government-office-style internal **document records management system**: register
official papers, classify and route them, track them by an official tracking
number, attach source files, and keep a full audit trail — with role-based access.

- **Stack:** Laravel 12 (PHP 8.2+), Inertia 2, React 19 + TypeScript, Tailwind CSS 4, shadcn/ui, Ziggy, spatie/laravel-permission.
- **Database:** MySQL (Laragon) in normal use; SQLite supported for local/dev.
- **Theme:** deep-navy primary, dark-navy sidebar, amber accent, slate neutrals.

---

## 1. Running it

```bash
composer install
npm install
# Database — MySQL (default): set DB_CONNECTION=mysql, DB_DATABASE=storage_system in .env
#   …or SQLite (no server needed): set DB_CONNECTION=sqlite  (uses database/database.sqlite)
php artisan key:generate
php artisan migrate:fresh --seed

# Run (two options)
npm run build           # compile assets, then:
php artisan serve --port=8080      # http://127.0.0.1:8080
# — or for hot-reload development —
npm run dev             # Vite dev server (see "Local dev notes" below)
```

> **Local dev note (Windows/Laragon):** the Vite dev server may write `public/hot`
> as `http://[::1]:5173` (IPv6). If pages render blank when browsing
> `127.0.0.1:8080`, run `npm run build` and delete `public/hot` to serve the
> compiled assets from the same origin, or set `server.host` in `vite.config.js`.

### Seeded accounts (password: `password`)

| Email | Role | Access |
|---|---|---|
| `admin@storagesystem.test` | System Administrator | Everything + User Management + permanent delete |
| `manager@storagesystem.test` | Records Administrator | Records + General Setup + archive/restore (no purge, no users) |
| `staff@storagesystem.test` | Encoder | Create/edit/archive records; browse & reports |

The seed loads **28 document types / 18 categories / 10 departments** and
**~450–500 mock document records** with statuses, classifications, priorities, and tags.

---

## 2. Roles & permissions

Powered by spatie/laravel-permission. The `admin` role also passes every gate via
a `Gate::before` bypass (see `AppServiceProvider`).

| Permission | Grants | Roles |
|---|---|---|
| `document.manage` | create / edit / archive / restore document records, upload/delete attachments | admin, manager, staff |
| `setting.manage` | manage document types, categories, departments (General Setup) | admin, manager |
| `setting.purge` | permanently delete archived records/types/categories | admin |
| `user.manage` | User Management + User Activity audit | admin |

Gates are shared to the frontend in `HandleInertiaRequests` as `auth.can.*`
(`manageDocument`, `manageSetting`, `purgeSetting`, `manageUser`).

---

## 3. Modules

| Module | URL | Notes |
|---|---|---|
| **Dashboard** | `/dashboard` | Home. Stat cards, uploads-per-month, status/classification/priority/department breakdowns, pending queue, recent records. |
| **File Records** | `/records` | Premium table: search, advanced filters (type/department/status/priority/classification), sortable columns, pagination, bulk archive, CSV export, archived view (`?trashed=1`). |
| **Create / Edit Record** | `/records/create`, `/records/{id}/edit` | Multi-section form (basic info, classification & routing, dates/amount/remarks) + live summary panel + auto tracking number. |
| **Record Detail** | `/records/{id}` | Tabbed profile: Overview, Attachments, Activity, Versions, Remarks. Copy tracking #, print, edit, archive. |
| **Browse by Type** | `/papers`, `/papers/{code}` | Per-paper-type drill-down with quick add. |
| **General Setup** | `/setup` | Hub → Document Types, Categories, Departments (CRUD), system reference values, Archive. |
| **Reports** | `/reports` | Overview + records report grouped by dept/type/status/classification/priority (date range, bar chart, CSV, print). |
| **User Activity** | `/reports/activity` | Audit trail of all logged actions (filter by user/action/date). Super Admin only. |
| **User Management** | `/users` | Users table + create/edit with role assignment. Super Admin only. |

---

## 4. Data model

- **document_types** — `code` (unique abbreviation), `name`, `document_category_id`, `description`, `is_active`, `sort_order`, soft-deletes.
- **document_categories** — `name` (unique), `slug`, `description`, `is_active`, `sort_order`, soft-deletes.
- **departments** — `code` (unique), `name`, `head_of_office`, `email`, `contact_number`, `is_active`, `sort_order`, soft-deletes.
- **documents** (the file records) — `tracking_no` (unique, official number entered at upload — required), `reference_no` (unique), `title`, `document_type_id`, `department_id`, `description`, `status`, `classification`, `priority`, `tags` (json), `document_date`, `amount`, `prepared_by`, soft-deletes.
- **document_attachments** — `document_id`, `original_name`, `path`, `mime_type`, `size`, `uploaded_by`, `download_count`.
- **document_versions** — `document_id`, `version_no`, `changed_by`, `summary`, `snapshot` (json).
- **activity_logs** — `document_id`, `user_id`, `action`, `description`, `properties` (json).

### Standardized values (system reference — `/setup/reference`)

- **Statuses:** draft, received, for_review, for_approval, approved, released, returned, pending, completed, cancelled
- **Classifications:** public, internal, confidential, restricted, highly_confidential (confidential+ marked sensitive)
- **Priorities:** low, normal, high, urgent, critical

Badge colors for all of the above are centralized in `resources/js/types/documents.ts` and rendered by `resources/js/components/badges.tsx`.

---

## 5. Attachments, versions & audit trail

- **Attachments** (`AttachmentController`) — real uploads to the `local` disk under `attachments/{document}/…`. Validated: PDF/JPG/PNG/DOC(X)/XLS(X)/CSV/TXT, ≤ 10 MB. Download streams the file and increments `download_count`. Upload/delete require `document.manage`; download requires auth.
  - Routes: `POST records/{record}/attachments`, `GET attachments/{attachment}/download`, `DELETE attachments/{attachment}`.
- **Versions** — a snapshot of key fields is captured on every authenticated create/edit (`document_versions`), shown in the Versions tab.
- **Activity log** — `DocumentObserver` (registered in `AppServiceProvider`) records `created`, `updated`, `status_changed`, `archived`, `restored`, `attachment_added/removed`, and `downloaded`. It only logs **authenticated** actions, so seeding stays clean. Surfaced on each record's Activity tab and system-wide at `/reports/activity`.

---

## 6. Key files

| Area | Path |
|---|---|
| Records (table/form/detail/CRUD/export) | `app/Http/Controllers/RecordController.php`, `resources/js/pages/records/*` |
| Attachments | `app/Http/Controllers/AttachmentController.php`, `app/Models/DocumentAttachment.php` |
| Audit/versions | `app/Observers/DocumentObserver.php`, `app/Models/{ActivityLog,DocumentVersion}.php` |
| Reports + User Activity | `app/Http/Controllers/ReportController.php`, `resources/js/pages/reports/*` |
| Users | `app/Http/Controllers/UserController.php`, `resources/js/pages/users/index.tsx` |
| Setup (types/categories/departments/reference) | `app/Http/Controllers/Setup/*`, `resources/js/pages/setup/*` |
| Layout | `resources/js/components/{app-sidebar,app-topbar}.tsx`, `resources/js/layouts/app/app-sidebar-layout.tsx` |
| Shared UI | `resources/js/components/{badges,page-header,stat-card,empty-state}.tsx`, `resources/js/components/ui/*` |
| Theme tokens | `resources/css/app.css` |
| Seeders | `database/seeders/*` |

---

## 7. Testing

```bash
php artisan test                 # full suite (in-memory SQLite)
php artisan test --filter=Record # File Records, attachments, activity
```

Current coverage: **62 tests / 237 assertions** across auth, document types,
papers, records (CRUD, filters, bulk, force-delete, CSV/reports), attachments,
versions, activity logging, departments, users, and gating.

See also: [Document Types](document-types.md) · [Documents & Dashboard](documents-and-dashboard.md) ·
[Admin guide](document-types-guide.md) · [Checklist](document-types-checklist.md)
