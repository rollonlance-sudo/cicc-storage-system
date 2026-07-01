<?php

namespace App\Providers;

use App\Models\Document;
use App\Observers\DocumentObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
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
        // Generate https URLs when the app URL is https (e.g. on Vercel behind TLS) —
        // prevents http asset URLs being blocked as mixed content on an https page.
        if (str_starts_with((string) config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        // System Administrator (admin role) implicitly passes every gate/permission check.
        Gate::before(fn ($user, string $ability) => $user->hasRole('admin') ? true : null);

        // Audit trail + version snapshots for document changes.
        Document::observe(DocumentObserver::class);
    }
}
