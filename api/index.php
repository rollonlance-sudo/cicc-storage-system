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

require __DIR__.'/../public/index.php';
