<?php

use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Papers\DocumentController;
use App\Http\Controllers\Papers\PaperController;
use App\Http\Controllers\RecordController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Setup\DepartmentController;
use App\Http\Controllers\Setup\ArchiveController;
use App\Http\Controllers\Setup\DocumentCategoryController;
use App\Http\Controllers\Setup\DocumentTypeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Dashboard is the home of the app.
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // File Records — global, filterable table + detail. Reading needs only auth.
    Route::get('records', [RecordController::class, 'index'])->name('records.index');
    Route::get('records/export', [RecordController::class, 'export'])->name('records.export');
    Route::middleware('can:document.manage')->group(function () {
        Route::get('records/create', [RecordController::class, 'create'])->name('records.create');
        Route::post('records', [RecordController::class, 'store'])->name('records.store');
        Route::post('records/bulk-archive', [RecordController::class, 'bulkDestroy'])->name('records.bulk-archive');
        Route::get('records/{record}/edit', [RecordController::class, 'edit'])->name('records.edit');
        Route::patch('records/{record}', [RecordController::class, 'update'])->name('records.update');
        Route::delete('records/{record}', [RecordController::class, 'destroy'])->name('records.destroy');
        Route::post('records/{id}/restore', [RecordController::class, 'restore'])->name('records.restore');
        Route::delete('records/{id}/force', [RecordController::class, 'forceDestroy'])->middleware('can:setting.purge')->name('records.force');
        Route::post('records/{record}/attachments', [AttachmentController::class, 'store'])->name('records.attachments.store');
        Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy'])->name('attachments.destroy');
    });
    Route::get('attachments/{attachment}/download', [AttachmentController::class, 'download'])->name('attachments.download');
    Route::get('records/{record}', [RecordController::class, 'show'])->name('records.show');

    // Reports — read access for all authenticated users.
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/records', [ReportController::class, 'records'])->name('reports.records');
    Route::get('reports/records/export', [ReportController::class, 'export'])->name('reports.records.export');
    // User Activity audit trail — Super Admin only.
    Route::get('reports/activity', [ReportController::class, 'activity'])->middleware('can:user.manage')->name('reports.activity');

    // Browse-by-type (secondary view). Reading needs only auth.
    Route::get('papers', [PaperController::class, 'index'])->name('papers.index');
    Route::get('papers/{documentType:code}', [PaperController::class, 'show'])->name('papers.show');

    // Per-type quick add — writing needs document.manage.
    Route::middleware('can:document.manage')->group(function () {
        Route::post('papers/{documentType:code}/documents', [DocumentController::class, 'store'])->name('documents.store');
        Route::patch('documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
        Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
        Route::post('documents/{id}/restore', [DocumentController::class, 'restore'])->name('documents.restore');
    });

    // User Management — Super Admin only.
    Route::middleware('can:user.manage')->group(function () {
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    // General Setup — manage document/paper types and their categories.
    Route::middleware('can:setting.manage')->prefix('setup')->name('setup.')->group(function () {
        Route::get('/', fn () => Inertia::render('setup/landing', [
            'counts' => [
                'types' => \App\Models\DocumentType::count(),
                'categories' => \App\Models\DocumentCategory::count(),
                'departments' => \App\Models\Department::where('is_active', true)->count(),
                'statuses' => count(\App\Models\Document::STATUSES),
                'classifications' => count(\App\Models\Document::CLASSIFICATIONS),
                'priorities' => count(\App\Models\Document::PRIORITIES),
            ],
        ]))->name('index');

        // Document types
        Route::get('document-types', [DocumentTypeController::class, 'index'])->name('document-types.index');
        Route::post('document-types', [DocumentTypeController::class, 'store'])->name('document-types.store');
        Route::patch('document-types/{documentType}', [DocumentTypeController::class, 'update'])->name('document-types.update');
        Route::delete('document-types/{documentType}', [DocumentTypeController::class, 'destroy'])->name('document-types.destroy');
        Route::post('document-types/{id}/restore', [DocumentTypeController::class, 'restore'])->name('document-types.restore');
        Route::delete('document-types/{id}/force', [DocumentTypeController::class, 'forceDestroy'])
            ->middleware('can:setting.purge')->name('document-types.force');

        // Categories
        Route::post('categories', [DocumentCategoryController::class, 'store'])->name('categories.store');
        Route::patch('categories/{documentCategory}', [DocumentCategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{documentCategory}', [DocumentCategoryController::class, 'destroy'])->name('categories.destroy');
        Route::post('categories/{id}/restore', [DocumentCategoryController::class, 'restore'])->name('categories.restore');
        Route::delete('categories/{id}/force', [DocumentCategoryController::class, 'forceDestroy'])
            ->middleware('can:setting.purge')->name('categories.force');

        // Departments / Offices
        Route::get('departments', [DepartmentController::class, 'index'])->name('departments.index');
        Route::post('departments', [DepartmentController::class, 'store'])->name('departments.store');
        Route::patch('departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
        Route::delete('departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');
        Route::post('departments/{id}/restore', [DepartmentController::class, 'restore'])->name('departments.restore');

        // System reference (read-only standardized values)
        Route::get('reference', [DocumentTypeController::class, 'reference'])->name('reference');

        // Archive (trash)
        Route::get('archive', [ArchiveController::class, 'index'])->name('archive.index');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
