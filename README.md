# GovFile Storage System

A polished, government-office-style internal records management system built on
**Laravel 12 + React 19 + Inertia 2** (Tailwind 4 + shadcn/ui), with role-based
access control via **spatie/laravel-permission**. Deep-navy theme, grouped
collapsible sidebar, global search topbar, and a consistent badge/empty/loading
component system.

## Modules

- **Dashboard** (`/dashboard`, home) — stat cards, uploads-per-month chart, status/classification/priority/department breakdowns, pending queue, recent records.
- **File Records** (`/records`) — premium table across all types: search, advanced filters (type, department, status, priority, classification), sortable columns, pagination, bulk archive, CSV export, and an archived view.
- **Create / Edit Record** (`/records/create`) — multi-section form (basic info, classification & routing, dates/amount/remarks) with a live summary panel and auto-generated tracking number.
- **Record Detail** (`/records/{id}`) — tabbed profile (Overview, Remarks, Activity, Attachments) with copy-tracking-number, print, edit, and archive.
- **Browse by Type** (`/papers`, `/papers/{code}`) — per-paper-type drill-down with quick add.
- **General Setup** (`/setup`) — Document Types, Categories, **Departments** (full CRUD), and a system-reference page for statuses/classifications/priorities; plus the types/categories Archive.
- **Reports** (`/reports`) — overview + grouped records report (by department/type/status/classification/priority) with date range, bar chart, CSV export, and a print layout.
- **User Management** (`/users`, Super Admin only) — users table + create/edit with role assignment.

Badges follow a consistent gov palette for statuses, priorities, security
classifications, and roles. Action feedback uses a global toast.

## Documentation

- **[docs/govfile-system.md](docs/govfile-system.md)** — full system documentation (setup, roles, modules, data model, attachments/versions/audit, key files, testing).
- [docs/document-types.md](docs/document-types.md) · [docs/documents-and-dashboard.md](docs/documents-and-dashboard.md) · [docs/document-types-guide.md](docs/document-types-guide.md) · [docs/document-types-checklist.md](docs/document-types-checklist.md)

## Stack

- Laravel 12 (PHP 8.2+) · Inertia 2 · Ziggy
- React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui
- MySQL (Laragon) — SQLite supported as a fallback
- spatie/laravel-permission (roles & permissions)

## Getting started

```bash
composer install
npm install
cp .env.example .env          # if needed; configure DB (MySQL: storage_system)
php artisan key:generate
php artisan migrate:fresh --seed
composer run dev              # serves Laravel + Vite + queue + logs
# or: npm run dev  +  php artisan serve
```

Open the app via Laragon (`http://storagesystem.test`) or `http://127.0.0.1:8000`.

### Seeded accounts (password: `password`)

| Role | Email |
|---|---|
| System Administrator | `admin@storagesystem.test` |
| Records Manager | `manager@storagesystem.test` |
| Staff | `staff@storagesystem.test` |

> Public self-registration is disabled; administrators create users.

## General Setup — Document / Paper Types

Admins manage the catalogue of government-style paper/document types
(full name, unique abbreviation/code, category, description, active status, sort
order) under **General Setup** in the sidebar. Categories are managed in the same
page and feed the category selector. Records use a soft-delete **Archive**:
deactivate → archive → restore, and only the System Administrator can permanently
delete. The system is seeded with **28 standard document types across 18
categories**.

Documentation:
- [docs/document-types.md](docs/document-types.md) — feature/technical reference
- [docs/document-types-guide.md](docs/document-types-guide.md) — admin user guide
- [docs/document-types-checklist.md](docs/document-types-checklist.md) — setup & QA checklist

## Documents & Papers (app home)

Actual document (paper) **records** are stored against each type. **Documents**
(`/papers`) is the **home page** — a search/storage hub. The search box looks
*inside* every type (reference no., title, preparer, description) and surfaces
matching records; you can also browse by category, where every paper type gets its
**own page** (`/papers/{code}`) listing its records with search, status filter, and
add/edit/archive (for users with `document.manage`: admin, manager, staff). Action
feedback appears as **toast** pop-ups (top-right). A **mock seeder** populates
~450–500 sample documents out of the box. (There is no dashboard.)

- [docs/documents-and-dashboard.md](docs/documents-and-dashboard.md) — feature/technical reference

## Tests

```bash
php artisan test
php artisan test --filter=DocumentType
```
