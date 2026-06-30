<?php

/**
 * Vercel serverless entrypoint for the CICC Storage System (Laravel).
 *
 * Vercel's filesystem is read-only except for /tmp, so Laravel's writable
 * storage is redirected to /tmp/storage (see bootstrap/app.php). The runtime
 * directories are created here on each cold start before the framework boots.
 */

$storage = '/tmp/storage';
foreach ([
    $storage.'/app/public',
    $storage.'/framework/cache/data',
    $storage.'/framework/sessions',
    $storage.'/framework/testing',
    $storage.'/framework/views',
    $storage.'/logs',
] as $dir) {
    if (! is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

/*
 * Self-contained demo database: on a read-only serverless filesystem, copy the
 * bundled, pre-seeded SQLite file into the writable /tmp on cold start. Set
 * DB_CONNECTION=sqlite and DB_DATABASE=/tmp/database.sqlite in the Vercel env.
 * Writes work per-instance and reset on the next cold start (fine for a demo).
 */
$demo = __DIR__.'/../database/demo.sqlite';
$live = '/tmp/database.sqlite';
if (! file_exists($live) && file_exists($demo)) {
    @copy($demo, $live);
}

require __DIR__.'/../public/index.php';
