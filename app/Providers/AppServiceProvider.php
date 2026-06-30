<?php

namespace App\Providers;

use App\Models\Document;
use App\Observers\DocumentObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // System Administrator (admin role) implicitly passes every gate/permission check.
        Gate::before(fn ($user, string $ability) => $user->hasRole('admin') ? true : null);

        // Audit trail + version snapshots for document changes.
        Document::observe(DocumentObserver::class);
    }
}
