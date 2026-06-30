# CICC Storage System

A polished, government-office-style internal **document records management
system** built on **Laravel 12 + React 19 + Inertia 2** (Tailwind 4 + shadcn/ui),
with role-based access control via **spatie/laravel-permission**. Deep-navy theme,
grouped collapsible sidebar, global search topbar, and a consistent
badge / empty-state / toast component system.

## Modules

- **Dashboard** (`/dashboard`, home) — stat cards, uploads-per-month chart, status/classification/priority/department breakdowns, pending queue, recent records.
- **File Records** (`/records`) — premium table across all types: search, advanced filters (type, department, status, priority, classification), sortable columns, pagination, bulk archive, CSV export, and an archived view.
- **Create / Edit Record** (`/records/create`) — multi-section form (basic info, classification & routing, dates/amount/remarks) with a live summary panel and auto-generated tracking number.
- **Record Detail** (`/records/{id}`) — tabbed profile (Overview · Attachments · Activity · Versions · Remarks) with copy-tracking-number, print, edit, and archive.
- **Browse by Type** (`/papers`, `/papers/{code}`) — per-paper-type drill-down with quick add.
- **General Setup** (`/setup`) — Document Types, Categories, Departments (full CRUD), and a system-reference page; plus the types/categories Archive.
- **Reports** (`/reports`) — overview + grouped records report (by department/type/status/classification/priority) with date range, bar chart, CSV export, and a print layout.
- **User Activity** (`/reports/activity`) — system-wide audit trail (Super Admin only).
- **User Management** (`/users`, Super Admin only) — users table + create/edit with role assignment.

Attachments are real uploads (download-tracked); each record keeps version
snapshots and an activity audit log. Badges follow a consistent gov palette for
statuses, priorities, security classifications, and roles; action feedback uses a
global toast.

## Stack

- Laravel 12 (PHP 8.2+) · Inertia 2 · Ziggy
- React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui
- MySQL (Laragon) — SQLite supported as a local fallback
- spatie/laravel-permission (roles & permissions)

## Getting started

```bash
composer install
npm install
cp .env.example .env          # configure DB — MySQL: storage_system, or DB_CONNECTION=sqlite
php artisan key:generate
php artisan migrate:fresh --seed
npm run build                 # then:
php artisan serve --port=8080 # http://127.0.0.1:8080
```

### Seeded accounts (password: `password`)

| Role | Email | Access |
|---|---|---|
| System Administrator | `admin@storagesystem.test` | Everything + User Management + permanent delete |
| Records Administrator | `manager@storagesystem.test` | Records + General Setup (no purge / no users) |
| Encoder | `staff@storagesystem.test` | Create/edit/archive records; browse & reports |

Public self-registration is disabled; administrators create users. The seed loads
28 document types / 18 categories / 10 departments and ~450–500 mock records.

## Documentation

- **[docs/cicc-storage-system.md](docs/cicc-storage-system.md)** — full system documentation (setup, roles, modules, data model, attachments/versions/audit, key files, testing).
- [docs/document-types.md](docs/document-types.md) · [docs/documents-and-dashboard.md](docs/documents-and-dashboard.md) · [docs/document-types-guide.md](docs/document-types-guide.md) · [docs/document-types-checklist.md](docs/document-types-checklist.md)
- **[docs/deploy-vercel.md](docs/deploy-vercel.md)** — deploying to Vercel (vercel-php runtime + external MySQL + S3).

## Tests

```bash
php artisan test                 # full suite (in-memory SQLite)
php artisan test --filter=Record
```
